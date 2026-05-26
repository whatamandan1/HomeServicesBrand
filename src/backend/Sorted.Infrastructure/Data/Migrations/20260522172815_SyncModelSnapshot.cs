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
        // StripeInvoiceId is added in AddStripeInvoiceId (SQLite) or PostgresSchemaRepair (PostgreSQL).

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
