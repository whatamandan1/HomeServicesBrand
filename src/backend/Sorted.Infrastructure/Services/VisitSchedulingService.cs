using Microsoft.EntityFrameworkCore;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class VisitSchedulingService(SortedDbContext db, IWorkflowLogger workflow) : IVisitSchedulingService
{
    public async Task GenerateVisitsForSubscriptionAsync(Guid subscriptionId, int count = 4, CancellationToken ct = default)
    {
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.Properties)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId, ct)
            ?? throw new InvalidOperationException("Subscription not found.");

        var property = sub.Customer.Properties.FirstOrDefault(p => p.IsPrimary && !p.IsDeleted)
            ?? sub.Customer.Properties.FirstOrDefault(p => !p.IsDeleted)
            ?? throw new InvalidOperationException("No property on subscription.");

        var start = DateTime.UtcNow.Date.AddDays(7);
        for (var i = 0; i < count; i++)
        {
            var visit = new JobVisit
            {
                CustomerSubscriptionId = sub.Id,
                CustomerPropertyId = property.Id,
                ScheduledDate = start.AddDays(i * 7),
                AvailabilityWindow = sub.AvailabilityPreference,
                Status = VisitStatus.Scheduled
            };
            db.JobVisits.Add(visit);
        }
        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("scheduling", "visits_generated", nameof(CustomerSubscription), sub.Id, new { count }, ct);
    }

    public async Task OpenVisitsForDispatchAsync(CancellationToken ct = default)
    {
        var visits = await db.JobVisits
            .Where(v => v.Status == VisitStatus.Scheduled && !v.IsDeleted)
            .ToListAsync(ct);

        foreach (var visit in visits)
        {
            visit.Status = VisitStatus.OpenForClaim;
            db.DispatchOffers.Add(new DispatchOffer
            {
                JobVisitId = visit.Id,
                Status = DispatchOfferStatus.Open,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(3)
            });
        }
        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("dispatch", "visits_opened", null, null, new { count = visits.Count }, ct);
    }

    public static string PostcodeSector(string postcode)
    {
        var normalized = postcode.Replace(" ", "", StringComparison.Ordinal).ToUpperInvariant();
        return normalized.Length >= 3 ? normalized[..3] : normalized;
    }
}
