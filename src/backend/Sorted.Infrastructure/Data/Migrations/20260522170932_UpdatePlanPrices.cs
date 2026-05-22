using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePlanPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 29.95 WHERE BillingInterval = 1;");
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 299.95 WHERE BillingInterval = 2;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 49 WHERE BillingInterval = 1;");
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 499 WHERE BillingInterval = 2;");
        }
    }
}
