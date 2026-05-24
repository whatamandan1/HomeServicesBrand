using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sorted.Core;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class ProviderEarningsService(
    SortedDbContext db,
    IOptions<ProviderPayoutOptions> payoutOptions,
    IOptions<BackgroundJobsOptions> jobOptions,
    IWorkflowLogger workflow) : IProviderEarningsService
{
    private readonly ProviderPayoutOptions _payoutOptions = payoutOptions.Value;
    private readonly BackgroundJobsOptions _jobOptions = jobOptions.Value;

    public async Task AccrueForCompletedVisitAsync(Guid jobVisitId, Guid providerId, CancellationToken ct = default)
    {
        var exists = await db.ProviderEarnings.AnyAsync(
            e => e.JobVisitId == jobVisitId && !e.IsDeleted,
            ct);
        if (exists)
            return;

        var visit = await db.JobVisits.AsNoTracking()
            .Include(v => v.Property)
            .Include(v => v.Subscription).ThenInclude(s => s.Plan)
            .FirstOrDefaultAsync(v => v.Id == jobVisitId && !v.IsDeleted, ct)
            ?? throw new InvalidOperationException("Visit not found.");

        if (visit.Status != VisitStatus.Completed)
            throw new InvalidOperationException("Earnings can only accrue for completed visits.");

        var amount = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            visit.Subscription.Plan.PriceGbp,
            visit.Subscription.Plan.BillingInterval,
            _jobOptions.VisitIntervalDays,
            _payoutOptions.SharePercent);

        var earning = new ProviderEarning
        {
            ProviderId = providerId,
            JobVisitId = jobVisitId,
            AmountGbp = amount,
            Status = ProviderEarningStatus.Accrued,
        };
        db.ProviderEarnings.Add(earning);
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "payout",
            "earning_accrued",
            nameof(ProviderEarning),
            earning.Id,
            new { jobVisitId, providerId, amount },
            ct);
    }

    public async Task<ProviderEarningsSummaryResponse> GetProviderEarningsAsync(
        Guid providerId,
        CancellationToken ct = default)
    {
        var earnings = await db.ProviderEarnings.AsNoTracking()
            .Include(e => e.JobVisit).ThenInclude(v => v.Property)
            .Where(e => e.ProviderId == providerId && !e.IsDeleted)
            .OrderByDescending(e => e.CreatedAtUtc)
            .ToListAsync(ct);

        var responses = earnings.Select(MapResponse).ToList();
        var accrued = responses
            .Where(e => e.Status == ProviderEarningStatus.Accrued)
            .Sum(e => e.AmountGbp);
        var paid = responses
            .Where(e => e.Status == ProviderEarningStatus.Paid)
            .Sum(e => e.AmountGbp);

        return new ProviderEarningsSummaryResponse(accrued, paid, responses);
    }

    public async Task<ProviderEarningResponse> MarkPaidAsync(
        Guid earningId,
        string? notes,
        CancellationToken ct = default)
    {
        var earning = await db.ProviderEarnings
            .Include(e => e.JobVisit).ThenInclude(v => v.Property)
            .FirstOrDefaultAsync(e => e.Id == earningId && !e.IsDeleted, ct)
            ?? throw new InvalidOperationException("Earning not found.");

        if (earning.Status != ProviderEarningStatus.Accrued)
            throw new InvalidOperationException("Only accrued earnings can be marked paid.");

        earning.Status = ProviderEarningStatus.Paid;
        earning.PaidAtUtc = DateTime.UtcNow;
        earning.PayoutNotes = string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
        earning.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "payout",
            "earning_marked_paid",
            nameof(ProviderEarning),
            earning.Id,
            new { earning.ProviderId, earning.AmountGbp },
            ct);

        return MapResponse(earning);
    }

    private static ProviderEarningResponse MapResponse(ProviderEarning earning) =>
        new(
            earning.Id,
            earning.JobVisitId,
            earning.JobVisit.ScheduledDate,
            earning.JobVisit.Property.Postcode,
            earning.AmountGbp,
            earning.Status,
            earning.PaidAtUtc,
            earning.PayoutNotes);
}
