using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Enums;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Data;

public static class DatabaseInitializer
{
    public const string InitialMigrationId = "20260522165220_InitialCreate";

    public static async Task InitializeAsync(
        SortedDbContext db,
        ILogger logger,
        IConfiguration? configuration = null,
        CancellationToken ct = default)
    {
        await StampLegacyEnsureCreatedDatabaseAsync(db, logger, ct);
        await PostgresSchemaRepair.ApplyAsync(db, logger, ct);
        await StampSchemaRepairMigrationsAsync(db, logger, ct);

        try
        {
            await db.Database.MigrateAsync(ct);
            var seedDemoData = configuration?.GetSection(FeaturesOptions.Section).Get<FeaturesOptions>()?.SeedDemoData ?? true;
            await DataSeeder.SeedAsync(db, logger, seedDemoData, ct);
            await DataSeeder.EnsurePlanPricingAsync(db, logger, configuration, ct);
            if (configuration is not null)
                await DataSeeder.ApplyStripePriceIdsAsync(db, configuration, logger, ct);
            DatabaseMigrationState.MarkReady();
            logger.LogInformation("Database migrated and seeded successfully");
        }
        catch (Exception ex)
        {
            DatabaseMigrationState.MarkFailed(ex.GetBaseException().Message);
            throw;
        }
    }

    /// <summary>
    /// Existing Railway/SQLite databases created with EnsureCreated have no migration history.
    /// Stamp the initial migration so MigrateAsync does not try to recreate existing tables.
    /// </summary>
    private static async Task StampLegacyEnsureCreatedDatabaseAsync(
        SortedDbContext db,
        ILogger logger,
        CancellationToken ct)
    {
        if (await db.Database.GetAppliedMigrationsAsync(ct) is var applied && applied.Any())
            return;

        if (!await db.Database.CanConnectAsync(ct))
            return;

        if (!await LegacySchemaExistsAsync(db, ct))
            return;

        logger.LogWarning(
            "Detected legacy EnsureCreated schema without migration history; stamping {MigrationId}",
            InitialMigrationId);

        var provider = db.Database.ProviderName ?? string.Empty;
        var isSqlite = provider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase);

        if (isSqlite)
        {
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
                    "MigrationId" TEXT NOT NULL CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY,
                    "ProductVersion" TEXT NOT NULL
                );
                """,
                ct);
            await db.Database.ExecuteSqlRawAsync(
                $"""
                 INSERT OR IGNORE INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                 VALUES ('{InitialMigrationId}', '9.0.0');
                 """,
                ct);
        }
        else
        {
            await db.Database.ExecuteSqlRawAsync(
                """
                CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
                    "MigrationId" character varying(150) NOT NULL,
                    "ProductVersion" character varying(32) NOT NULL,
                    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
                );
                """,
                ct);
            await db.Database.ExecuteSqlRawAsync(
                $"""
                 INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                 VALUES ('{InitialMigrationId}', '9.0.0')
                 ON CONFLICT ("MigrationId") DO NOTHING;
                 """,
                ct);
        }
    }

    private static async Task<bool> LegacySchemaExistsAsync(SortedDbContext db, CancellationToken ct)
    {
        try
        {
            _ = await db.Brands.AsNoTracking().Select(b => b.Id).FirstOrDefaultAsync(ct);
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// PostgresSchemaRepair creates tables before EF migrations run. Stamp matching migrations so
    /// MigrateAsync does not fail and demo seeding can proceed on existing Railway databases.
    /// </summary>
    private static async Task StampSchemaRepairMigrationsAsync(
        SortedDbContext db,
        ILogger logger,
        CancellationToken ct)
    {
        if (!(db.Database.ProviderName ?? "").Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            return;

        var applied = (await db.Database.GetAppliedMigrationsAsync(ct)).ToHashSet(StringComparer.Ordinal);
        var repairMigrations = new (string MigrationId, string TableName)[]
        {
            ("20260524155254_AddPortfolioEnquiries", "PortfolioEnquiries"),
            ("20260524160712_AddDemoLandlordAccount", "MultiPropertyAccounts"),
            ("20260526082750_AddSignupLeads", "SignupLeads"),
        };

        foreach (var (migrationId, tableName) in repairMigrations)
        {
            if (applied.Contains(migrationId))
                continue;

            if (!await PostgresTableExistsAsync(db, tableName, ct))
                continue;

            logger.LogWarning(
                "Stamping migration {MigrationId} because {Table} already exists from schema repair",
                migrationId,
                tableName);

            await db.Database.ExecuteSqlRawAsync(
                """
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES ({0}, '9.0.0')
                ON CONFLICT ("MigrationId") DO NOTHING;
                """,
                migrationId);
        }
    }

    private static async Task<bool> PostgresTableExistsAsync(
        SortedDbContext db,
        string tableName,
        CancellationToken ct)
    {
        var connection = db.Database.GetDbConnection();
        if (connection.State != System.Data.ConnectionState.Open)
            await db.Database.OpenConnectionAsync(ct);

        await using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT EXISTS (
                SELECT 1
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND lower(table_name) = lower(@tableName)
            );
            """;
        var parameter = command.CreateParameter();
        parameter.ParameterName = "@tableName";
        parameter.Value = tableName;
        command.Parameters.Add(parameter);

        var result = await command.ExecuteScalarAsync(ct);
        return result is bool exists && exists;
    }
}
