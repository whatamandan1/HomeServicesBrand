using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class AddStripeInvoiceId : Migration
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
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            DO $$
            DECLARE t text;
            BEGIN
                SELECT table_name INTO t
                FROM information_schema.tables
                WHERE table_schema = 'public'
                  AND lower(table_name) IN ('payments', 'paymentrecords')
                LIMIT 1;

                IF t IS NOT NULL THEN
                    EXECUTE format(
                        'ALTER TABLE %I DROP COLUMN IF EXISTS "StripeInvoiceId"',
                        t);
                END IF;
            END $$;
            """);
    }
}
