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
        await db.Database.MigrateAsync(ct);
        await DataSeeder.SeedAsync(db, logger, ct);
        await DataSeeder.EnsurePlanPricingAsync(db, logger, configuration, ct);
        if (configuration is not null)
            await DataSeeder.ApplyStripePriceIdsAsync(db, configuration, logger, ct);
        logger.LogInformation("Database migrated and seeded successfully");
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
}
