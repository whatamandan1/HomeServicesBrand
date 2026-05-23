using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTermsPropertyMediaPreferredProvider : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PreferredProviderId",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TermsAcceptedAtUtc",
                table: "Customers",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PropertyMedia",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    CustomerPropertyId = table.Column<Guid>(type: "TEXT", nullable: false),
                    FileName = table.Column<string>(type: "TEXT", nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", nullable: false),
                    Data = table.Column<byte[]>(type: "BLOB", nullable: false),
                    SizeBytes = table.Column<int>(type: "INTEGER", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PropertyMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PropertyMedia_CustomerProperties_CustomerPropertyId",
                        column: x => x.CustomerPropertyId,
                        principalTable: "CustomerProperties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerSubscriptions_PreferredProviderId",
                table: "CustomerSubscriptions",
                column: "PreferredProviderId");

            migrationBuilder.CreateIndex(
                name: "IX_PropertyMedia_CustomerPropertyId",
                table: "PropertyMedia",
                column: "CustomerPropertyId");

            migrationBuilder.AddForeignKey(
                name: "FK_CustomerSubscriptions_Providers_PreferredProviderId",
                table: "CustomerSubscriptions",
                column: "PreferredProviderId",
                principalTable: "Providers",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CustomerSubscriptions_Providers_PreferredProviderId",
                table: "CustomerSubscriptions");

            migrationBuilder.DropTable(
                name: "PropertyMedia");

            migrationBuilder.DropIndex(
                name: "IX_CustomerSubscriptions_PreferredProviderId",
                table: "CustomerSubscriptions");

            migrationBuilder.DropColumn(
                name: "PreferredProviderId",
                table: "CustomerSubscriptions");

            migrationBuilder.DropColumn(
                name: "TermsAcceptedAtUtc",
                table: "Customers");
        }
    }
}
