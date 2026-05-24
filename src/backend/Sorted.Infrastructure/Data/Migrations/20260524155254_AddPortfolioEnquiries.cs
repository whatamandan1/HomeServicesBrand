using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPortfolioEnquiries : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PortfolioEnquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    BrandId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ContactName = table.Column<string>(type: "TEXT", nullable: false),
                    Email = table.Column<string>(type: "TEXT", nullable: false),
                    Phone = table.Column<string>(type: "TEXT", nullable: false),
                    CompanyName = table.Column<string>(type: "TEXT", nullable: true),
                    Notes = table.Column<string>(type: "TEXT", nullable: true),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioEnquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PortfolioEnquiries_Brands_BrandId",
                        column: x => x.BrandId,
                        principalTable: "Brands",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PortfolioEnquiryProperties",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    PortfolioEnquiryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    SortOrder = table.Column<int>(type: "INTEGER", nullable: false),
                    Line1 = table.Column<string>(type: "TEXT", nullable: false),
                    Line2 = table.Column<string>(type: "TEXT", nullable: true),
                    City = table.Column<string>(type: "TEXT", nullable: false),
                    Postcode = table.Column<string>(type: "TEXT", nullable: false),
                    GardenSize = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioEnquiryProperties", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PortfolioEnquiryProperties_PortfolioEnquiries_PortfolioEnquiryId",
                        column: x => x.PortfolioEnquiryId,
                        principalTable: "PortfolioEnquiries",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioEnquiries_BrandId",
                table: "PortfolioEnquiries",
                column: "BrandId");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioEnquiries_Email",
                table: "PortfolioEnquiries",
                column: "Email");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioEnquiryProperties_PortfolioEnquiryId",
                table: "PortfolioEnquiryProperties",
                column: "PortfolioEnquiryId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PortfolioEnquiryProperties");

            migrationBuilder.DropTable(
                name: "PortfolioEnquiries");
        }
    }
}
