using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class ThreeGardenSizeBands : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "CustomerProperties" SET "GardenSize" = 3 WHERE "GardenSize" > 3;
            UPDATE "SignupLeads" SET "GardenSize" = 3 WHERE "GardenSize" > 3;
            UPDATE "PortfolioEnquiryProperties" SET "GardenSize" = 3 WHERE "GardenSize" > 3;
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 59.99 WHERE "Name" = 'Essential Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 599.90 WHERE "Name" = 'Essential Annual';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 84.99 WHERE "Name" = 'Premium Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 849.90 WHERE "Name" = 'Premium Annual';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 119.99 WHERE "Name" = 'Elite Monthly';
            UPDATE "SubscriptionPlans" SET "PriceGbp" = 1199.90 WHERE "Name" = 'Elite Annual';
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
