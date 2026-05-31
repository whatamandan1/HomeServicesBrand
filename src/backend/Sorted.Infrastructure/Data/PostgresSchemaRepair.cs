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

    private const string ProviderEarningsSql = """
        CREATE TABLE IF NOT EXISTS "ProviderEarnings" (
            "Id" uuid NOT NULL,
            "ProviderId" uuid NOT NULL,
            "JobVisitId" uuid NOT NULL,
            "AmountGbp" numeric NOT NULL,
            "Status" integer NOT NULL,
            "PaidAtUtc" timestamp with time zone NULL,
            "PayoutNotes" text NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_ProviderEarnings" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_ProviderEarnings_Providers_ProviderId" FOREIGN KEY ("ProviderId") REFERENCES "Providers" ("Id") ON DELETE CASCADE,
            CONSTRAINT "FK_ProviderEarnings_JobVisits_JobVisitId" FOREIGN KEY ("JobVisitId") REFERENCES "JobVisits" ("Id") ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX IF NOT EXISTS "IX_ProviderEarnings_JobVisitId"
            ON "ProviderEarnings" ("JobVisitId");

        CREATE INDEX IF NOT EXISTS "IX_ProviderEarnings_ProviderId"
            ON "ProviderEarnings" ("ProviderId");
        """;

    private const string PortfolioEnquiriesSql = """
        CREATE TABLE IF NOT EXISTS "PortfolioEnquiries" (
            "Id" uuid NOT NULL,
            "BrandId" uuid NOT NULL,
            "ContactName" text NOT NULL,
            "Email" text NOT NULL,
            "Phone" text NOT NULL,
            "CompanyName" text NULL,
            "Notes" text NULL,
            "Status" integer NOT NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_PortfolioEnquiries" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_PortfolioEnquiries_Brands_BrandId" FOREIGN KEY ("BrandId") REFERENCES "Brands" ("Id") ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS "IX_PortfolioEnquiries_Email"
            ON "PortfolioEnquiries" ("Email");

        CREATE TABLE IF NOT EXISTS "PortfolioEnquiryProperties" (
            "Id" uuid NOT NULL,
            "PortfolioEnquiryId" uuid NOT NULL,
            "SortOrder" integer NOT NULL,
            "Line1" text NOT NULL,
            "Line2" text NULL,
            "City" text NOT NULL,
            "Postcode" text NOT NULL,
            "GardenSize" integer NOT NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_PortfolioEnquiryProperties" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_PortfolioEnquiryProperties_PortfolioEnquiries_PortfolioEnquiryId" FOREIGN KEY ("PortfolioEnquiryId") REFERENCES "PortfolioEnquiries" ("Id") ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS "IX_PortfolioEnquiryProperties_PortfolioEnquiryId"
            ON "PortfolioEnquiryProperties" ("PortfolioEnquiryId");
        """;

    private const string MultiPropertyAccountsSql = """
        CREATE TABLE IF NOT EXISTS "MultiPropertyAccounts" (
            "Id" uuid NOT NULL,
            "UserId" uuid NOT NULL,
            "BrandId" uuid NOT NULL,
            "CompanyName" text NULL,
            "IndicativeMonthlyGbp" numeric NULL,
            "AgreementNotes" text NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_MultiPropertyAccounts" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_MultiPropertyAccounts_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE,
            CONSTRAINT "FK_MultiPropertyAccounts_Brands_BrandId" FOREIGN KEY ("BrandId") REFERENCES "Brands" ("Id") ON DELETE CASCADE
        );

        CREATE UNIQUE INDEX IF NOT EXISTS "IX_MultiPropertyAccounts_UserId"
            ON "MultiPropertyAccounts" ("UserId");

        CREATE TABLE IF NOT EXISTS "MultiPropertyAccountProperties" (
            "Id" uuid NOT NULL,
            "MultiPropertyAccountId" uuid NOT NULL,
            "SortOrder" integer NOT NULL,
            "Line1" text NOT NULL,
            "Line2" text NULL,
            "City" text NOT NULL,
            "Postcode" text NOT NULL,
            "GardenSize" integer NOT NULL,
            "VisitFrequency" text NOT NULL,
            "ServiceLevel" text NOT NULL,
            "NextVisitDate" timestamp with time zone NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_MultiPropertyAccountProperties" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_MultiPropertyAccountProperties_MultiPropertyAccounts_MultiPropertyAccountId" FOREIGN KEY ("MultiPropertyAccountId") REFERENCES "MultiPropertyAccounts" ("Id") ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS "IX_MultiPropertyAccountProperties_MultiPropertyAccountId"
            ON "MultiPropertyAccountProperties" ("MultiPropertyAccountId");
        """;

    private const string SignupLeadsSql = """
        CREATE TABLE IF NOT EXISTS "SignupLeads" (
            "Id" uuid NOT NULL,
            "BrandId" uuid NOT NULL,
            "Email" text NOT NULL,
            "Phone" text NOT NULL,
            "FirstName" text NOT NULL,
            "LastName" text NULL,
            "MarketingOptIn" boolean NOT NULL,
            "LastStep" integer NOT NULL,
            "SelectedPlanName" text NULL,
            "GardenSize" integer NULL,
            "Postcode" text NULL,
            "SessionId" text NULL,
            "Status" integer NOT NULL,
            "ConvertedAtUtc" timestamp with time zone NULL,
            "CreatedAtUtc" timestamp with time zone NOT NULL,
            "UpdatedAtUtc" timestamp with time zone NULL,
            "IsDeleted" boolean NOT NULL DEFAULT FALSE,
            CONSTRAINT "PK_SignupLeads" PRIMARY KEY ("Id"),
            CONSTRAINT "FK_SignupLeads_Brands_BrandId" FOREIGN KEY ("BrandId") REFERENCES "Brands" ("Id") ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS "IX_SignupLeads_BrandId_Email"
            ON "SignupLeads" ("BrandId", "Email");
        """;

    private const string ProviderVettingSql = """
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DateOfBirth" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "IdDocumentType" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "IdDocumentNumber" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "RightToWorkShareCode" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "RightToWorkDocumentDescription" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsCertificateNumber" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsIssueDate" TEXT NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsOnUpdateService" boolean NOT NULL DEFAULT FALSE;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "VettingSubmittedAtUtc" timestamp with time zone NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "IdVerifiedAtUtc" timestamp with time zone NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "RightToWorkVerifiedAtUtc" timestamp with time zone NULL;
        ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsVerifiedAtUtc" timestamp with time zone NULL;
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
            await db.Database.ExecuteSqlRawAsync(ProviderEarningsSql, ct);
            await db.Database.ExecuteSqlRawAsync(PortfolioEnquiriesSql, ct);
            await db.Database.ExecuteSqlRawAsync(MultiPropertyAccountsSql, ct);
            await db.Database.ExecuteSqlRawAsync(SignupLeadsSql, ct);
            await db.Database.ExecuteSqlRawAsync(ProviderVettingSql, ct);
            logger.LogInformation("PostgreSQL schema repair completed");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "PostgreSQL schema repair failed");
        }
    }
}
