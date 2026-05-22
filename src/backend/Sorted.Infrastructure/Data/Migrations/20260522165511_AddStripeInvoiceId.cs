using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class AddStripeInvoiceId : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Provider-agnostic: works on PostgreSQL (Railway) and SQLite (local).
        migrationBuilder.Sql("""
            ALTER TABLE "Payments" ADD COLUMN IF NOT EXISTS "StripeInvoiceId" TEXT NULL;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            ALTER TABLE "Payments" DROP COLUMN IF EXISTS "StripeInvoiceId";
            """);
    }
}
