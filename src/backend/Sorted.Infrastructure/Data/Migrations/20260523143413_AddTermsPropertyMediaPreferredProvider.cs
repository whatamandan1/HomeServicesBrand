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
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    ALTER TABLE "Customers"
                    ADD COLUMN IF NOT EXISTS "TermsAcceptedAtUtc" timestamp with time zone NULL;

                    ALTER TABLE "CustomerSubscriptions"
                    ADD COLUMN IF NOT EXISTS "PreferredProviderId" uuid NULL;

                    CREATE TABLE IF NOT EXISTS "PropertyMedia" (
                        "Id" uuid NOT NULL,
                        "CustomerPropertyId" uuid NOT NULL,
                        "FileName" text NOT NULL,
                        "ContentType" text NOT NULL,
                        "Data" bytea NOT NULL,
                        "SizeBytes" integer NOT NULL,
                        "CreatedAtUtc" timestamp with time zone NOT NULL,
                        "UpdatedAtUtc" timestamp with time zone NULL,
                        "IsDeleted" boolean NOT NULL DEFAULT FALSE,
                        CONSTRAINT "PK_PropertyMedia" PRIMARY KEY ("Id"),
                        CONSTRAINT "FK_PropertyMedia_CustomerProperties_CustomerPropertyId" FOREIGN KEY ("CustomerPropertyId") REFERENCES "CustomerProperties" ("Id") ON DELETE CASCADE
                    );

                    CREATE INDEX IF NOT EXISTS "IX_PropertyMedia_CustomerPropertyId"
                        ON "PropertyMedia" ("CustomerPropertyId");

                    CREATE INDEX IF NOT EXISTS "IX_CustomerSubscriptions_PreferredProviderId"
                        ON "CustomerSubscriptions" ("PreferredProviderId");

                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_constraint
                            WHERE conname = 'FK_CustomerSubscriptions_Providers_PreferredProviderId'
                        ) THEN
                            ALTER TABLE "CustomerSubscriptions"
                            ADD CONSTRAINT "FK_CustomerSubscriptions_Providers_PreferredProviderId"
                            FOREIGN KEY ("PreferredProviderId") REFERENCES "Providers" ("Id");
                        END IF;
                    END $$;
                    """);

                return;
            }

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
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    ALTER TABLE "CustomerSubscriptions"
                    DROP CONSTRAINT IF EXISTS "FK_CustomerSubscriptions_Providers_PreferredProviderId";

                    DROP TABLE IF EXISTS "PropertyMedia";

                    ALTER TABLE "CustomerSubscriptions" DROP COLUMN IF EXISTS "PreferredProviderId";
                    ALTER TABLE "Customers" DROP COLUMN IF EXISTS "TermsAcceptedAtUtc";
                    """);

                return;
            }

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
