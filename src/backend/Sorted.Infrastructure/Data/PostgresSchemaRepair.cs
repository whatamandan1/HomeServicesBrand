using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Sorted.Infrastructure.Data;

internal static class PostgresSchemaRepair
{
    private const string AddStripeInvoiceIdSql = """
        DO $$
        DECLARE t text;
        BEGIN
            SELECT table_name INTO t
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND lower(table_name) IN ('payments', 'paymentrecords')
            ORDER BY CASE lower(table_name) WHEN 'payments' THEN 0 ELSE 1 END
            LIMIT 1;

            IF t IS NOT NULL THEN
                EXECUTE format(
                    'ALTER TABLE %I ADD COLUMN IF NOT EXISTS "StripeInvoiceId" TEXT NULL',
                    t);
            END IF;
        END $$;
        """;

    public static async Task ApplyAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (!(db.Database.ProviderName ?? "").Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
            return;

        try
        {
            await db.Database.ExecuteSqlRawAsync(AddStripeInvoiceIdSql, ct);
            logger.LogInformation("PostgreSQL schema repair completed");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "PostgreSQL schema repair failed");
        }
    }
}
