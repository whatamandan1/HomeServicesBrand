using Microsoft.Extensions.Configuration;
using Npgsql;

namespace Sorted.Infrastructure.Data;

public static class DatabaseConfiguration
{
    public static string ResolveConnectionString(IConfiguration configuration)
    {
        var databaseUrl = configuration["DATABASE_URL"];
        if (IsUsablePostgresUrl(databaseUrl))
            return ParsePostgresUrl(databaseUrl!);

        var defaultCs = configuration.GetConnectionString("Default");
        if (IsUsablePostgresUrl(defaultCs))
            return defaultCs!.StartsWith("postgres", StringComparison.OrdinalIgnoreCase)
                ? ParsePostgresUrl(defaultCs)
                : defaultCs!;

        var fromPgVars = BuildFromPgEnvironmentVariables(configuration);
        if (fromPgVars is not null)
            return fromPgVars;

        return defaultCs ?? "Data Source=sorted.db";
    }

    public static string DescribeSource(IConfiguration configuration)
    {
        var databaseUrl = configuration["DATABASE_URL"];
        if (!string.IsNullOrWhiteSpace(databaseUrl))
        {
            if (databaseUrl.Contains("${{", StringComparison.Ordinal))
                return "DATABASE_URL unresolved (fix Railway variable reference)";
            if (IsPostgres(databaseUrl))
                return "DATABASE_URL";
        }

        var defaultCs = configuration.GetConnectionString("Default");
        if (IsUsablePostgresUrl(defaultCs))
            return "ConnectionStrings:Default";

        if (!string.IsNullOrWhiteSpace(configuration["PGHOST"]))
            return "PGHOST/PGPORT/PGUSER/PGDATABASE";

        return "SQLite fallback (appsettings or sorted.db)";
    }

    public static bool IsPostgres(string connectionString) =>
        connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase)
        || connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase)
        || connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase);

    private static bool IsUsablePostgresUrl(string? value) =>
        !string.IsNullOrWhiteSpace(value)
        && !value.Contains("${{", StringComparison.Ordinal)
        && IsPostgres(value);

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
            SslMode = host.Contains("railway", StringComparison.OrdinalIgnoreCase)
                ? SslMode.Prefer
                : SslMode.Require,
        };
        return builder.ConnectionString;
    }

    public static string ParsePostgresUrl(string databaseUrl)
    {
        var uri = new Uri(databaseUrl);
        var userInfo = uri.UserInfo.Split(':', 2);
        var builder = new NpgsqlConnectionStringBuilder
        {
            Host = uri.Host,
            Port = uri.Port > 0 ? uri.Port : 5432,
            Database = uri.AbsolutePath.TrimStart('/'),
            Username = Uri.UnescapeDataString(userInfo[0]),
            Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : string.Empty,
            SslMode = uri.Host.Contains("railway", StringComparison.OrdinalIgnoreCase)
                ? SslMode.Prefer
                : SslMode.Require,
        };
        return builder.ConnectionString;
    }
}
