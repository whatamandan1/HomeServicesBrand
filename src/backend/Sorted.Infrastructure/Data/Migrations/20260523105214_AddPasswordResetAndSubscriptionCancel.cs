using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPasswordResetAndSubscriptionCancel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    ALTER TABLE "CustomerSubscriptions"
                    ADD COLUMN IF NOT EXISTS "CancelsAtUtc" timestamp with time zone NULL;

                    CREATE TABLE IF NOT EXISTS "PasswordResetTokens" (
                        "Id" uuid NOT NULL,
                        "UserId" uuid NOT NULL,
                        "TokenHash" text NOT NULL,
                        "ExpiresAtUtc" timestamp with time zone NOT NULL,
                        "UsedAtUtc" timestamp with time zone NULL,
                        "CreatedAtUtc" timestamp with time zone NOT NULL,
                        "UpdatedAtUtc" timestamp with time zone NULL,
                        "IsDeleted" boolean NOT NULL DEFAULT FALSE,
                        CONSTRAINT "PK_PasswordResetTokens" PRIMARY KEY ("Id"),
                        CONSTRAINT "FK_PasswordResetTokens_Users_UserId" FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE
                    );

                    CREATE UNIQUE INDEX IF NOT EXISTS "IX_PasswordResetTokens_TokenHash"
                        ON "PasswordResetTokens" ("TokenHash");

                    CREATE INDEX IF NOT EXISTS "IX_PasswordResetTokens_UserId"
                        ON "PasswordResetTokens" ("UserId");
                    """);

                return;
            }

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelsAtUtc",
                table: "CustomerSubscriptions",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PasswordResetTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserId = table.Column<Guid>(type: "TEXT", nullable: false),
                    TokenHash = table.Column<string>(type: "TEXT", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UsedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "TEXT", nullable: true),
                    IsDeleted = table.Column<bool>(type: "INTEGER", nullable: false, defaultValue: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PasswordResetTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PasswordResetTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_TokenHash",
                table: "PasswordResetTokens",
                column: "TokenHash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PasswordResetTokens_UserId",
                table: "PasswordResetTokens",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("""
                    DROP TABLE IF EXISTS "PasswordResetTokens";
                    ALTER TABLE "CustomerSubscriptions" DROP COLUMN IF EXISTS "CancelsAtUtc";
                    """);
                return;
            }

            migrationBuilder.DropTable(
                name: "PasswordResetTokens");

            migrationBuilder.DropColumn(
                name: "CancelsAtUtc",
                table: "CustomerSubscriptions");
        }
    }
}
