using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProviderCoverageArea : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "CoverageLatitude",
                table: "Providers",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CoverageLongitude",
                table: "Providers",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CoveragePostcode",
                table: "Providers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "CoverageRadiusMiles",
                table: "Providers",
                type: "REAL",
                nullable: false,
                defaultValue: 10.0);

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "CustomerProperties",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "CustomerProperties",
                type: "REAL",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverageLatitude",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "CoverageLongitude",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "CoveragePostcode",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "CoverageRadiusMiles",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "CustomerProperties");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "CustomerProperties");
        }
    }
}
