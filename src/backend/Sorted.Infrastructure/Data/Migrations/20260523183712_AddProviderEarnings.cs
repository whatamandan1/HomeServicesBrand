using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProviderEarnings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    CREATE TABLE IF NOT EXISTS "ProviderEarnings" (
                        "Id" uuid NOT NULL,
                        "ProviderId" uuid NOT NULL,
                        "JobVisitId" uuid NOT NULL,
                        "AmountGbp" numeric NOT NULL,
                        "Status" integer NOT NULL,
                        "PaidAtUtc" timestamp with time zone NULL,
                        "PayoutNotes" text NULL,
                        "CreatedAtUtc" timestamp with time zone NOT NULL,
                        "UpdatedAtUtc" timestamp with time zone NULL,
                        "IsDeleted" boolean NOT NULL DEFAULT FALSE,
                        CONSTRAINT "PK_ProviderEarnings" PRIMARY KEY ("Id"),
                        CONSTRAINT "FK_ProviderEarnings_Providers_ProviderId" FOREIGN KEY ("ProviderId") REFERENCES "Providers" ("Id") ON DELETE CASCADE,
                        CONSTRAINT "FK_ProviderEarnings_JobVisits_JobVisitId" FOREIGN KEY ("JobVisitId") REFERENCES "JobVisits" ("Id") ON DELETE CASCADE
                    );

                    CREATE UNIQUE INDEX IF NOT EXISTS "IX_ProviderEarnings_JobVisitId"
                        ON "ProviderEarnings" ("JobVisitId");

                    CREATE INDEX IF NOT EXISTS "IX_ProviderEarnings_ProviderId"
                        ON "ProviderEarnings" ("ProviderId");
                    """);

                return;
            }

            migrationBuilder.CreateTable(
                name: "ProviderEarnings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    ProviderId = table.Column<Guid>(type: "TEXT", nullable: false),
                    JobVisitId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AmountGbp = table.Column<decimal>(type: "TEXT", nullable: false),
                    Status = table.Column<int>(type: "INTEGER", nullable: false),
                    PaidAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    PayoutNotes = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProviderEarnings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProviderEarnings_JobVisits_JobVisitId",
                        column: x => x.JobVisitId,
                        principalTable: "JobVisits",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProviderEarnings_Providers_ProviderId",
                        column: x => x.ProviderId,
                        principalTable: "Providers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProviderEarnings_JobVisitId",
                table: "ProviderEarnings",
                column: "JobVisitId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProviderEarnings_ProviderId",
                table: "ProviderEarnings",
                column: "ProviderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    DROP TABLE IF EXISTS "ProviderEarnings";
                    """);
                return;
            }

            migrationBuilder.DropTable(
                name: "ProviderEarnings");
        }
    }
}
