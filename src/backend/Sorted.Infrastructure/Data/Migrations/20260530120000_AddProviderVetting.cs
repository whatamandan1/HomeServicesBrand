using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sorted.Infrastructure.Data.Migrations;

public partial class AddProviderVetting : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DateOfBirth" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "IdDocumentType" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "IdDocumentNumber" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "RightToWorkShareCode" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "RightToWorkDocumentDescription" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsCertificateNumber" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsIssueDate" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsOnUpdateService" INTEGER NOT NULL DEFAULT 0;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "VettingSubmittedAtUtc" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "IdVerifiedAtUtc" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "RightToWorkVerifiedAtUtc" TEXT NULL;
            ALTER TABLE "Providers" ADD COLUMN IF NOT EXISTS "DbsVerifiedAtUtc" TEXT NULL;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
    }
}
