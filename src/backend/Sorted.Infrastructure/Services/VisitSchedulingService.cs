using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class VisitSchedulingService(
    SortedDbContext db,
    IWorkflowLogger workflow,
    IEmailService email,
    ISmsService sms,
    IOptions<BackgroundJobsOptions> jobOptions,
    ILogger<VisitSchedulingService> logger) : IVisitSchedulingService
{
    private readonly BackgroundJobsOptions _jobOptions = jobOptions.Value;

    public async Task GenerateVisitsForSubscriptionAsync(Guid subscriptionId, int count = 4, CancellationToken ct = default)
    {
        var sub = await LoadSubscriptionAsync(subscriptionId, ct)
            ?? throw new InvalidOperationException("Subscription not found.");

        var property = ResolveProperty(sub);
        var start = DateTime.UtcNow.Date.AddDays(_jobOptions.VisitIntervalDays);
        await AddVisitsAsync(sub, property, start, count, ct);
    }

    public async Task TopUpFutureVisitsAsync(int targetCount = 4, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var activeSubscriptionIds = await db.CustomerSubscriptions
            .Where(s => s.Status == SubscriptionStatus.Active && !s.IsDeleted)
            .Select(s => s.Id)
            .ToListAsync(ct);

        var toppedUp = 0;
        foreach (var subscriptionId in activeSubscriptionIds)
        {
            var sub = await LoadSubscriptionAsync(subscriptionId, ct);
            if (sub is null)
                continue;

            var property = ResolveProperty(sub);
            var futureCount = await db.JobVisits.CountAsync(v =>
                v.CustomerSubscriptionId == subscriptionId
                && !v.IsDeleted
                && (v.Status == VisitStatus.Scheduled
                    || v.Status == VisitStatus.OpenForClaim
                    || v.Status == VisitStatus.Claimed
                    || v.Status == VisitStatus.InProgress
                    || v.Status == VisitStatus.Rescheduled)
                && v.ScheduledDate >= today, ct);

            var needed = targetCount - futureCount;
            if (needed <= 0)
                continue;

            var lastScheduled = await db.JobVisits
                .Where(v =>
                    v.CustomerSubscriptionId == subscriptionId
                    && !v.IsDeleted
                    && (v.Status == VisitStatus.Scheduled
                        || v.Status == VisitStatus.OpenForClaim
                        || v.Status == VisitStatus.Claimed
                        || v.Status == VisitStatus.InProgress
                        || v.Status == VisitStatus.Rescheduled))
                .MaxAsync(v => (DateTime?)v.ScheduledDate, ct);

            var start = lastScheduled?.AddDays(_jobOptions.VisitIntervalDays) ?? today.AddDays(_jobOptions.VisitIntervalDays);
            await AddVisitsAsync(sub, property, start, needed, ct);
            toppedUp++;
        }

        if (toppedUp > 0)
            logger.LogInformation("Topped up future visits for {Count} active subscriptions", toppedUp);
    }

    public async Task OpenVisitsForDispatchAsync(CancellationToken ct = default)
        => await OpenVisitsForDispatchAsync(
            await db.JobVisits
                .Where(v => v.Status == VisitStatus.Scheduled && !v.IsDeleted)
                .ToListAsync(ct),
            ct);

    public async Task OpenUpcomingVisitsForDispatchAsync(int withinDays = 14, CancellationToken ct = default)
    {
        var cutoff = DateTime.UtcNow.Date.AddDays(withinDays);
        var visits = await db.JobVisits
            .Where(v =>
                v.Status == VisitStatus.Scheduled
                && !v.IsDeleted
                && v.ScheduledDate <= cutoff)
            .ToListAsync(ct);

        await OpenVisitsForDispatchAsync(visits, ct);
    }

    private async Task OpenVisitsForDispatchAsync(IReadOnlyList<JobVisit> visits, CancellationToken ct)
    {
        if (visits.Count == 0)
            return;

        var expiryDays = _jobOptions.DispatchOfferExpiryDays;
        var now = DateTime.UtcNow;
        foreach (var visit in visits)
        {
            visit.Status = VisitStatus.OpenForClaim;
            db.DispatchOffers.Add(new DispatchOffer
            {
                JobVisitId = visit.Id,
                Status = DispatchOfferStatus.Open,
                ExpiresAtUtc = now.AddDays(expiryDays)
            });
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("dispatch", "visits_opened", null, null, new { count = visits.Count }, ct);
    }

    public async Task ExpireStaleDispatchOffersAsync(int renewalExpiryDays = 3, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var staleOffers = await db.DispatchOffers
            .Include(o => o.JobVisit)
            .Where(o =>
                o.Status == DispatchOfferStatus.Open
                && o.ExpiresAtUtc != null
                && o.ExpiresAtUtc < now
                && !o.IsDeleted)
            .ToListAsync(ct);

        if (staleOffers.Count == 0)
            return;

        var renewed = 0;
        foreach (var offer in staleOffers)
        {
            offer.Status = DispatchOfferStatus.Expired;
            offer.UpdatedAtUtc = now;

            var visit = offer.JobVisit;
            if (visit.IsDeleted || visit.Status != VisitStatus.OpenForClaim)
                continue;

            db.DispatchOffers.Add(new DispatchOffer
            {
                JobVisitId = visit.Id,
                Status = DispatchOfferStatus.Open,
                ExpiresAtUtc = now.AddDays(renewalExpiryDays)
            });
            renewed++;
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "dispatch",
            "offers_expired",
            null,
            null,
            new { expired = staleOffers.Count, renewed },
            ct);
        logger.LogInformation(
            "Expired {Expired} dispatch offers; renewed {Renewed} for unclaimed visits",
            staleOffers.Count,
            renewed);
    }

    public async Task SendDueVisitRemindersAsync(int leadHours = 24, CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var reminderBy = now.AddHours(leadHours);

        var visits = await db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.Subscription).ThenInclude(s => s.Customer).ThenInclude(c => c.User)
            .Where(v =>
                !v.IsDeleted
                && v.ReminderSentAtUtc == null
                && (v.Status == VisitStatus.Scheduled
                    || v.Status == VisitStatus.OpenForClaim
                    || v.Status == VisitStatus.Claimed)
                && v.ScheduledDate >= now.Date
                && v.ScheduledDate <= reminderBy)
            .ToListAsync(ct);

        if (visits.Count == 0)
            return;

        var sent = 0;
        foreach (var visit in visits)
        {
            var customer = visit.Subscription.Customer.User;
            var postcode = visit.Property.Postcode;
            var window = visit.AvailabilityWindow;

            await email.SendVisitReminderEmailAsync(customer.Email, visit.ScheduledDate, postcode, window, ct);
            if (!string.IsNullOrWhiteSpace(customer.Phone))
                await sms.SendVisitReminderSmsAsync(customer.Phone, visit.ScheduledDate, postcode, ct);

            visit.ReminderSentAtUtc = now;
            visit.UpdatedAtUtc = now;
            sent++;
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("scheduling", "visit_reminders_sent", null, null, new { count = sent }, ct);
        logger.LogInformation("Sent {Count} pre-visit reminders", sent);
    }

    private async Task AddVisitsAsync(
        CustomerSubscription sub,
        CustomerProperty property,
        DateTime startDate,
        int count,
        CancellationToken ct)
    {
        for (var i = 0; i < count; i++)
        {
            db.JobVisits.Add(new JobVisit
            {
                CustomerSubscriptionId = sub.Id,
                CustomerPropertyId = property.Id,
                ScheduledDate = startDate.AddDays(i * _jobOptions.VisitIntervalDays),
                AvailabilityWindow = sub.AvailabilityPreference,
                Status = VisitStatus.Scheduled
            });
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "scheduling",
            "visits_generated",
            nameof(CustomerSubscription),
            sub.Id,
            new { count, startDate = startDate.ToString("yyyy-MM-dd") },
            ct);
    }

    private async Task<CustomerSubscription?> LoadSubscriptionAsync(Guid subscriptionId, CancellationToken ct)
        => await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.Properties)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && !s.IsDeleted, ct);

    private static CustomerProperty ResolveProperty(CustomerSubscription sub)
        => sub.Customer.Properties.FirstOrDefault(p => p.IsPrimary && !p.IsDeleted)
            ?? sub.Customer.Properties.FirstOrDefault(p => !p.IsDeleted)
            ?? throw new InvalidOperationException("No property on subscription.");

    public static string PostcodeSector(string postcode) => PostcodeFormat.Outcode(postcode);
}
