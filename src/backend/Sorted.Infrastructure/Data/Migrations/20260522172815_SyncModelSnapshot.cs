using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
/// <summary>
/// Idempotent catch-up for production DBs where earlier migrations were blocked by model snapshot warnings.
/// </summary>
public partial class SyncModelSnapshot : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
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
            """);

        migrationBuilder.Sql("""
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 29.95 WHERE "Name" = 'Essential Monthly';
            """);
        migrationBuilder.Sql("""
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 299.95 WHERE "Name" = 'Essential Annual';
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
