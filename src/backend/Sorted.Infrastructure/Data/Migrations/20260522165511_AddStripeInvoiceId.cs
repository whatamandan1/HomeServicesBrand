using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

/// <inheritdoc />
public partial class AddStripeInvoiceId : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
        {
            // Handled idempotently by PostgresSchemaRepair before MigrateAsync runs.
            return;
        }

        migrationBuilder.AddColumn<string>(
            name: "StripeInvoiceId",
            table: "Payments",
            type: "TEXT",
            nullable: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        if (migrationBuilder.ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            return;

        migrationBuilder.DropColumn(
            name: "StripeInvoiceId",
            table: "Payments");
    }
}
