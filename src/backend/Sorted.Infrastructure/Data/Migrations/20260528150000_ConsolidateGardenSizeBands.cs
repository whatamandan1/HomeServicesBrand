using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class ConsolidateGardenSizeBands : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Legacy XXLarge (5) → XLarge (4); four maintained-area bands only.
        migrationBuilder.Sql(
            """
            UPDATE "CustomerProperties" SET "GardenSize" = 4 WHERE "GardenSize" = 5;
            UPDATE "SignupLeads" SET "GardenSize" = 4 WHERE "GardenSize" = 5;
            UPDATE "PortfolioEnquiryProperties" SET "GardenSize" = 4 WHERE "GardenSize" = 5;
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Cannot restore which rows were XXLarge vs XLarge.
    }
}
