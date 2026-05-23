using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProviderAvailability : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    ALTER TABLE "Providers"
                    ADD COLUMN IF NOT EXISTS "WorkingDaysMask" integer NOT NULL DEFAULT 31;

                    ALTER TABLE "Providers"
                    ADD COLUMN IF NOT EXISTS "WorkDayStartMinutes" integer NOT NULL DEFAULT 480;

                    ALTER TABLE "Providers"
                    ADD COLUMN IF NOT EXISTS "WorkDayEndMinutes" integer NOT NULL DEFAULT 960;

                    CREATE TABLE IF NOT EXISTS "ProviderBlockedDates" (
                        "Id" uuid NOT NULL,
                        "ProviderId" uuid NOT NULL,
                        "BlockedDate" date NOT NULL,
                        "Reason" text NULL,
                        "CreatedAtUtc" timestamp with time zone NOT NULL,
                        "UpdatedAtUtc" timestamp with time zone NULL,
                        "IsDeleted" boolean NOT NULL DEFAULT FALSE,
                        CONSTRAINT "PK_ProviderBlockedDates" PRIMARY KEY ("Id"),
                        CONSTRAINT "FK_ProviderBlockedDates_Providers_ProviderId" FOREIGN KEY ("ProviderId") REFERENCES "Providers" ("Id") ON DELETE CASCADE
                    );

                    CREATE UNIQUE INDEX IF NOT EXISTS "IX_ProviderBlockedDates_ProviderId_BlockedDate"
                        ON "ProviderBlockedDates" ("ProviderId", "BlockedDate");
                    """);

                return;
            }

            migrationBuilder.AddColumn<int>(
                name: "WorkDayEndMinutes",
                table: "Providers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 960);

            migrationBuilder.AddColumn<int>(
                name: "WorkDayStartMinutes",
                table: "Providers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 480);

            migrationBuilder.AddColumn<int>(
                name: "WorkingDaysMask",
                table: "Providers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 31);

            migrationBuilder.CreateTable(
                name: "ProviderBlockedDates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProviderId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BlockedDate = table.Column<DateOnly>(type: "TEXT", nullable: false),
                    Reason = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProviderBlockedDates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProviderBlockedDates_Providers_ProviderId",
                        column: x => x.ProviderId,
                        principalTable: "Providers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProviderBlockedDates_ProviderId_BlockedDate",
                table: "ProviderBlockedDates",
                columns: new[] { "ProviderId", "BlockedDate" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    DROP TABLE IF EXISTS "ProviderBlockedDates";
                    ALTER TABLE "Providers" DROP COLUMN IF EXISTS "WorkDayEndMinutes";
                    ALTER TABLE "Providers" DROP COLUMN IF EXISTS "WorkDayStartMinutes";
                    ALTER TABLE "Providers" DROP COLUMN IF EXISTS "WorkingDaysMask";
                    """);
                return;
            }

            migrationBuilder.DropTable(
                name: "ProviderBlockedDates");

            migrationBuilder.DropColumn(
                name: "WorkDayEndMinutes",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "WorkDayStartMinutes",
                table: "Providers");

            migrationBuilder.DropColumn(
                name: "WorkingDaysMask",
                table: "Providers");
        }
    }
}
