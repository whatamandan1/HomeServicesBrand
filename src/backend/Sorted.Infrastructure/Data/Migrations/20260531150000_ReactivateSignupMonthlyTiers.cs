using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

public partial class ReactivateSignupMonthlyTiers : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "SubscriptionPlans" SET "IsActive" = 1
            WHERE "Name" IN ('Premium Monthly', 'Elite Monthly');
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            UPDATE "SubscriptionPlans" SET "IsActive" = 0
            WHERE "Name" IN ('Premium Monthly', 'Elite Monthly');
            """);
    }
}
