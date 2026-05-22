using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Sorted.Infrastructure.Data;

public static class DatabaseConfiguration
{
    private static readonly Regex PostgresUrlRegex = new(
        @"^postgres(?:ql)?://(?<user>[^:@/]+)(?::(?<pass>[^@]*))?@(?<host>[^:/]+)(?::(?<port>\d+))?/(?<database>[^?/#]+)",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    public static string ResolveConnectionString(IConfiguration configuration)
    {
        // Prefer individual PG* vars — most reliable on Railway when services are linked
        var fromPgVars = BuildFromPgEnvironmentVariables(configuration);
        if (fromPgVars is not null)
            return fromPgVars;

        foreach (var candidate in GetPostgresUrlCandidates(configuration))
        {
            if (IsUsablePostgresUrl(candidate))
                return ParsePostgresUrl(candidate!);
        }

        return configuration.GetConnectionString("Default") ?? "Data Source=sorted.db";
    }

    public static string DescribeSource(IConfiguration configuration)
    {
        if (HasPgEnvironmentVariables(configuration))
            return "PGHOST/PGPORT/PGUSER/PGPASSWORD";

        var databaseUrl = configuration["DATABASE_URL"];
        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            if (databaseUrl.Contains("${{", StringComparison.Ordinal))
                return "DATABASE_URL unresolved (fix Railway variable reference)";
            if (IsPostgres(databaseUrl))
                return "DATABASE_URL";
        }

        var publicUrl = configuration["DATABASE_PUBLIC_URL"];
        if (IsUsablePostgresUrl(publicUrl))
            return "DATABASE_PUBLIC_URL";

        return "SQLite fallback (appsettings or sorted.db)";
    }

    public static object DescribeDiagnostics(IConfiguration configuration)
    {
        var databaseUrl = configuration["DATABASE_URL"];
        var parsedHost = TryParseHost(databaseUrl);
        return new
        {
            hasDatabaseUrl = !string.IsNullOrWhiteSpace(databaseUrl),
            databaseUrlLooksUnresolved = databaseUrl?.Contains("${{", StringComparison.Ordinal) == true,
            parsedHostFromDatabaseUrl = parsedHost,
            hasPgHost = !string.IsNullOrWhiteSpace(configuration["PGHOST"]),
            pgHost = configuration["PGHOST"],
            hasPgPassword = !string.IsNullOrWhiteSpace(configuration["PGPASSWORD"]),
            source = DescribeSource(configuration),
        };
    }

    public static async Task<(bool CanConnect, string? Error, string? Host, string? SslMode)> TestConnectionAsync(
        string connectionString,
        CancellationToken ct = default)
    {
        if (!IsPostgres(connectionString))
            return (false, "Not a PostgreSQL connection string", null, null);

        var attempts = BuildConnectionAttempts(connectionString);
        Exception? lastError = null;
        foreach (var attempt in attempts)
        {
            try
            {
                await using var conn = new NpgsqlConnection(attempt.ConnectionString);
                await conn.OpenAsync(ct);
                var builder = new NpgsqlConnectionStringBuilder(attempt.ConnectionString);
                return (true, null, builder.Host, builder.SslMode.ToString());
            }
            catch (Exception ex)
            {
                lastError = ex;
            }
        }

        return (false, lastError?.Message ?? "Connection failed", attempts.FirstOrDefault().Host, null);
    }

    public static bool IsPostgres(string connectionString) =>
        connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase)
        || connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        || connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

    private static bool HasPgEnvironmentVariables(IConfiguration configuration) =>
        !string.IsNullOrWhiteSpace(configuration["PGHOST"])
        && !string.IsNullOrWhiteSpace(configuration["PGUSER"])
        && !string.IsNullOrWhiteSpace(configuration["PGPASSWORD"]);

    private static IEnumerable<string?> GetPostgresUrlCandidates(IConfiguration configuration)
    {
        yield return configuration["DATABASE_URL"];
        yield return configuration["DATABASE_PUBLIC_URL"];
        yield return configuration.GetConnectionString("Default");
    }

    private static bool IsUsablePostgresUrl(string? value) =>
        !string.IsNullOrWhiteSpace(value)
        && !value.Contains("${{", StringComparison.Ordinal)
        && IsPostgres(value);

    private static string? TryParseHost(string? databaseUrl)
    {
        if (string.IsNullOrWhiteSpace(databaseUrl))
            return null;
        try
        {
            if (databaseUrl.StartsWith("postgres", StringComparison.OrdinalIgnoreCase))
            {
                var match = PostgresUrlRegex.Match(databaseUrl);
                return match.Success ? match.Groups["host"].Value : new Uri(databaseUrl).Host;
            }

            return new NpgsqlConnectionStringBuilder(databaseUrl).Host;
        }
        catch
        {
            return null;
        }
    }

    private static string? BuildFromPgEnvironmentVariables(IConfiguration configuration)
    {
        var host = configuration["PGHOST"];
        if (string.IsNullOrWhiteSpace(host))
            return null;

        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = host,
            Port = int.TryParse(configuration["PGPORT"], out var port) ? port : 5432,
            Database = configuration["PGDATABASE"] ?? "railway",
            Username = configuration["PGUSER"] ?? "postgres",
            Password = configuration["PGPASSWORD"] ?? string.Empty,
        };
        ApplyRailwaySettings(builder);
        builder.Timeout = 15;
        return builder.ConnectionString;
    }

    public static string ParsePostgresUrl(string databaseUrl)
    {
        var builder = TryParseBuilder(databaseUrl);
        ApplyRailwaySettings(builder);
        builder.Timeout = 15;
        return builder.ConnectionString;
    }

    private static NpgsqlConnectionStringBuilder TryParseBuilder(string databaseUrl)
    {
        if (databaseUrl.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
            || databaseUrl.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            var regexMatch = PostgresUrlRegex.Match(databaseUrl);
            if (regexMatch.Success)
            {
                return new NpgsqlConnectionStringBuilder
                {
                    Host = regexMatch.Groups["host"].Value,
                    Port = regexMatch.Groups["port"].Success
                        ? int.Parse(regexMatch.Groups["port"].Value)
                        : 5432,
                    Database = Uri.UnescapeDataString(regexMatch.Groups["database"].Value),
                    Username = Uri.UnescapeDataString(regexMatch.Groups["user"].Value),
                    Password = regexMatch.Groups["pass"].Success
                        ? Uri.UnescapeDataString(regexMatch.Groups["pass"].Value)
                        : string.Empty,
                };
            }

            try
            {
                return new NpgsqlConnectionStringBuilder(databaseUrl);
            }
            catch
            {
                return ParsePostgresUriManually(databaseUrl);
            }
        }

        return new NpgsqlConnectionStringBuilder(databaseUrl);
    }

    private static NpgsqlConnectionStringBuilder ParsePostgresUriManually(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        return new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
        };
    }

    private static void ApplyRailwaySettings(NpgsqlConnectionStringBuilder builder)
    {
        var host = builder.Host ?? string.Empty;
        if (!host.Contains("railway", StringComparison.OrdinalIgnoreCase)
            && !host.Contains("rlwy.net", StringComparison.OrdinalIgnoreCase))
            return;

        if (host.Contains("railway.internal", StringComparison.OrdinalIgnoreCase))
            builder.SslMode = SslMode.Disable;
        else if (host.Contains("rlwy.net", StringComparison.OrdinalIgnoreCase)
                 || host.Contains("railway.app", StringComparison.OrdinalIgnoreCase))
            builder.SslMode = SslMode.Require;
        else
            builder.SslMode = SslMode.Prefer;
    }

    private static IEnumerable<(string ConnectionString, string? Host, string? SslMode)> BuildConnectionAttempts(
        string connectionString)
    {
        var baseBuilder = TryParseBuilder(connectionString);
        var variants = new List<NpgsqlConnectionStringBuilder>();

        var primary = new NpgsqlConnectionStringBuilder(baseBuilder.ConnectionString);
        ApplyRailwaySettings(primary);
        variants.Add(primary);

        variants.Add(new NpgsqlConnectionStringBuilder(baseBuilder.ConnectionString) { SslMode = SslMode.Disable });
        variants.Add(new NpgsqlConnectionStringBuilder(baseBuilder.ConnectionString) { SslMode = SslMode.Prefer });
        variants.Add(new NpgsqlConnectionStringBuilder(baseBuilder.ConnectionString) { SslMode = SslMode.Require });

        foreach (var v in variants)
        {
            v.Timeout = 10;
            yield return (v.ConnectionString, v.Host, v.SslMode.ToString());
        }
    }
}
