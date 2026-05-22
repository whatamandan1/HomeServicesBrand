using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Sorted.Infrastructure.Data;

internal static class PostgresSchemaRepair
{
    public static async Task ApplyAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (!(db.Database.ProviderName ?? "").Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            return;

        await EnsurePaymentsInvoiceColumnAsync(db, logger, ct);
    }

    private static async Task EnsurePaymentsInvoiceColumnAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        const string checkSql = """
            SELECT COUNT(*) FROM information_schema.columns
            WHERE table_schema = 'public'
              AND lower(table_name) = lower('Payments')
              AND lower(column_name) = lower('StripeInvoiceId')
            """;

        var exists = await db.Database.SqlQueryRaw<int>(checkSql).FirstOrDefaultAsync(ct) > 0;
        if (exists)
            return;

        logger.LogWarning("Repairing PostgreSQL schema: adding Payments.StripeInvoiceId");

        await db.Database.ExecuteSqlRawAsync("""
            DO $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'Payments'
                ) THEN
                    ALTER TABLE "Payments" ADD COLUMN IF NOT EXISTS "StripeInvoiceId" TEXT NULL;
                ELSIF EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_schema = 'public' AND table_name = 'payments'
                ) THEN
                    ALTER TABLE payments ADD COLUMN IF NOT EXISTS "StripeInvoiceId" TEXT NULL;
                END IF;
            END $$;
            """, ct);
    }
}
