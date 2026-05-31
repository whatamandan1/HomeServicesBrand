using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

public partial class DeactivateLegacyPlanTiers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "SubscriptionPlans" SET "IsActive" = 0
            WHERE "Name" IN ('Premium Monthly', 'Premium Annual', 'Elite Monthly', 'Elite Annual');
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
