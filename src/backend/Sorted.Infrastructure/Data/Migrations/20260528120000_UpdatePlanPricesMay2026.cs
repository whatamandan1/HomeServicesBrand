using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class UpdatePlanPricesMay2026 : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 39.95 WHERE "Name" = 'Essential Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 399.95 WHERE "Name" = 'Essential Annual';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 64.95 WHERE "Name" = 'Premium Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 559.95 WHERE "Name" = 'Premium Annual';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 99.95 WHERE "Name" = 'Elite Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 909.95 WHERE "Name" = 'Elite Annual';
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 29.95 WHERE "Name" = 'Essential Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 299.95 WHERE "Name" = 'Essential Annual';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 54.95 WHERE "Name" = 'Premium Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 549.95 WHERE "Name" = 'Premium Annual';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 89.95 WHERE "Name" = 'Elite Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 899.95 WHERE "Name" = 'Elite Annual';
            """);
    }
}
