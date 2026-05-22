using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class ForceUpdatePlanPricesByName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 29.95 WHERE Name = 'Essential Monthly';");
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 299.95 WHERE Name = 'Essential Annual';");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 49 WHERE Name = 'Essential Monthly';");
            migrationBuilder.Sql("UPDATE SubscriptionPlans SET PriceGbp = 499 WHERE Name = 'Essential Annual';");
        }
    }
}
