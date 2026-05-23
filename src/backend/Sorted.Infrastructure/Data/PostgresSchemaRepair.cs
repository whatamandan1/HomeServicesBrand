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

    private const string TermsPropertyMediaSql = """
        ALTER TABLE "Customers"
        ADD COLUMN IF NOT EXISTS "TermsAcceptedAtUtc" timestamp with time zone NULL;

        ALTER TABLE "CustomerSubscriptions"
        ADD COLUMN IF NOT EXISTS "PreferredProviderId" uuid NULL;

        CREATE TABLE IF NOT EXISTS "PropertyMedia" (
            "Id" uuid NOT NULL,
            "CustomerPropertyId" uuid NOT NULL,
            "FileName" text NOT NULL,
            "ContentType" text NOT NULL,
            "Data" bytea NOT NULL,
            "SizeBytes" integer NOT NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_PropertyMedia" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_PropertyMedia_CustomerProperties_CustomerPropertyId" FOREIGN KEY ("CustomerPropertyId") REFERENCES "CustomerProperties" ("Id") ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS "IX_PropertyMedia_CustomerPropertyId"
            ON "PropertyMedia" ("CustomerPropertyId");

        CREATE INDEX IF NOT EXISTS "IX_CustomerSubscriptions_PreferredProviderId"
            ON "CustomerSubscriptions" ("PreferredProviderId");

        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint
                WHERE conname = 'FK_CustomerSubscriptions_Providers_PreferredProviderId'
            ) THEN
                ALTER TABLE "CustomerSubscriptions"
                ADD CONSTRAINT "FK_CustomerSubscriptions_Providers_PreferredProviderId"
                FOREIGN KEY ("PreferredProviderId") REFERENCES "Providers" ("Id");
            END IF;
        END $$;
        """;

    private const string ProviderAvailabilitySql = """
        ALTER TABLE "Providers"
        ADD COLUMN IF NOT EXISTS "WorkingDaysMask" integer NOT NULL DEFAULT 31;

        ALTER TABLE "Providers"
        ADD COLUMN IF NOT EXISTS "WorkDayStartMinutes" integer NOT NULL DEFAULT 480;

        ALTER TABLE "Providers"
        ADD COLUMN IF NOT EXISTS "WorkDayEndMinutes" integer NOT NULL DEFAULT 960;

        CREATE TABLE IF NOT EXISTS "ProviderBlockedDates" (
            "Id" uuid NOT NULL,
            "ProviderId" uuid NOT NULL,
            "BlockedDate" date NOT NULL,
            "Reason" text NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_ProviderBlockedDates" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_ProviderBlockedDates_Providers_ProviderId" FOREIGN KEY ("ProviderId") REFERENCES "Providers" ("Id") ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX IF NOT EXISTS "IX_ProviderBlockedDates_ProviderId_BlockedDate"
            ON "ProviderBlockedDates" ("ProviderId", "BlockedDate");
        """;

    public static async Task ApplyAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (!(db.Database.ProviderName ?? "").Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            await db.Database.ExecuteSqlRawAsync(AddStripeInvoiceIdSql, ct);
            await db.Database.ExecuteSqlRawAsync(PasswordResetAndCancelSql, ct);
            await db.Database.ExecuteSqlRawAsync(TermsPropertyMediaSql, ct);
            await db.Database.ExecuteSqlRawAsync(ProviderAvailabilitySql, ct);
            logger.LogInformation("PostgreSQL schema repair completed");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "PostgreSQL schema repair failed");
        }
    }
}
