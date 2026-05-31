using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

public partial class AddProviderAddonEquipment : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "HasLeafBlower" INTEGER NOT NULL DEFAULT 0;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "HasHedgeTrimmer" INTEGER NOT NULL DEFAULT 0;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "HasPressureWasherForPatio" INTEGER NOT NULL DEFAULT 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
