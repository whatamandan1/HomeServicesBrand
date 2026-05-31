using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

public partial class AddProviderInsuranceVetting : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "HasOwnRelevantInsurance" INTEGER NOT NULL DEFAULT 0;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "InsuranceVerifiedAtUtc" TEXT NULL;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
