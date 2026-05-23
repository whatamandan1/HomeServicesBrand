using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Sorted.Infrastructure.Data;

internal static class PostgresSchemaRepair
{
    private const string AddStripeInvoiceIdSql = """
        DO $$
        DECLARE t text;
        BEGIN
            SELECT table_name INTO t
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND lower(table_name) IN ('payments', 'paymentrecords')
            ORDER BY CASE lower(table_name) WHEN 'payments' THEN 0 ELSE 1 END
            LIMIT 1;

            IF t IS NOT NULL THEN
                EXECUTE format(
                    'ALTER TABLE %I ADD COLUMN IF NOT EXISTS "StripeInvoiceId" TEXT NULL',
                    t);
            END IF;
        END $$;
        """;

    /// <summary>
    /// Idempotent schema fixes for PostgreSQL when SQLite-scaffolded migrations use incompatible types.
    /// </summary>
    private const string PasswordResetAndCancelSql = """
        ALTER TABLE "CustomerSubscriptions"
        ADD COLUMN IF NOT EXISTS "CancelsAtUtc" timestamp with time zone NULL;

        CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
            "Id" uuid NOT NULL,
            "UserId" uuid NOT NULL,
            "TokenHash" text NOT NULL,
            "ExpiresAtUtc" timestamp with time zone NOT NULL,
            "UsedAtUtc" timestamp with time zone NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_PasswordResetTokens" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_PasswordResetTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX IF NOT EXISTS "IX_PasswordResetTokens_TokenHash"
            ON "PasswordResetTokens" ("TokenHash");

        CREATE INDEX IF NOT EXISTS "IX_PasswordResetTokens_UserId"
            ON "PasswordResetTokens" ("UserId");
        """;

    public static async Task ApplyAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (!(db.Database.ProviderName ?? "").Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            await db.Database.ExecuteSqlRawAsync(AddStripeInvoiceIdSql, ct);
            await db.Database.ExecuteSqlRawAsync(PasswordResetAndCancelSql, ct);
            logger.LogInformation("PostgreSQL schema repair completed");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "PostgreSQL schema repair failed");
        }
    }
}
