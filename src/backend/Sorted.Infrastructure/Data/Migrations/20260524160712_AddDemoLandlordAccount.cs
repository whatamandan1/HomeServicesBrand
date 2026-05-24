using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDemoLandlordAccount : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MultiPropertyAccounts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BrandId = table.Column<Guid>(type: "TEXT", nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", nullable: true),
                    IndicativeMonthlyGbp = table.Column<decimal>(type: "TEXT", nullable: true),
                    AgreementNotes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MultiPropertyAccounts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MultiPropertyAccounts_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MultiPropertyAccounts_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MultiPropertyAccountProperties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    MultiPropertyAccountId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Line1 = table.Column<string>(type: "TEXT", nullable: false),
                    Line2 = table.Column<string>(type: "TEXT", nullable: true),
                    City = table.Column<string>(type: "TEXT", nullable: false),
                    Postcode = table.Column<string>(type: "TEXT", nullable: false),
                    GardenSize = table.Column<int>(type: "INTEGER", nullable: false),
                    VisitFrequency = table.Column<string>(type: "TEXT", nullable: false),
                    ServiceLevel = table.Column<string>(type: "TEXT", nullable: false),
                    NextVisitDate = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MultiPropertyAccountProperties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MultiPropertyAccountProperties_MultiPropertyAccounts_MultiPropertyAccountId",
                        column: x => x.MultiPropertyAccountId,
                        principalTable: "MultiPropertyAccounts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MultiPropertyAccountProperties_MultiPropertyAccountId",
                table: "MultiPropertyAccountProperties",
                column: "MultiPropertyAccountId");

            migrationBuilder.CreateIndex(
                name: "IX_MultiPropertyAccounts_BrandId",
                table: "MultiPropertyAccounts",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_MultiPropertyAccounts_UserId",
                table: "MultiPropertyAccounts",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MultiPropertyAccountProperties");

            migrationBuilder.DropTable(
                name: "MultiPropertyAccounts");
        }
    }
}
