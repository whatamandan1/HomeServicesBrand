using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Core.Plans;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class VisitSchedulingService(
    SortedDbContext db,
    IWorkflowLogger workflow,
    ICommunicationService communications,
    IProviderCoverageService coverage,
    IProviderAvailabilityService availability,
    IOptions<BackgroundJobsOptions> jobOptions,
    ILogger<VisitSchedulingService> logger) : IVisitSchedulingService
{
    private readonly BackgroundJobsOptions _jobOptions = jobOptions.Value;

    public async Task GenerateVisitsForSubscriptionAsync(Guid subscriptionId, int count = 4, CancellationToken ct = default)
    {
        var sub = await LoadSubscriptionAsync(subscriptionId, ct)
            ?? throw new InvalidOperationException("Subscription not found.");

        var property = ResolveProperty(sub);
        var intervalDays = PlanCatalog.VisitIntervalDays(sub.Plan.Name);
        var start = DateTime.UtcNow.Date.AddDays(intervalDays);
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

            var intervalDays = PlanCatalog.VisitIntervalDays(sub.Plan.Name);
            var start = lastScheduled?.AddDays(intervalDays) ?? today.AddDays(intervalDays);
            await AddVisitsAsync(sub, property, start, needed, ct);
            toppedUp++;
        }

        if (toppedUp > 0)
            logger.LogInformation("Topped up future visits for {Count} active subscriptions", toppedUp);
    }

    public async Task<OpenDispatchResult> OpenVisitsForDispatchAsync(CancellationToken ct = default)
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

    private async Task<OpenDispatchResult> OpenVisitsForDispatchAsync(IReadOnlyList<JobVisit> visits, CancellationToken ct)
    {
        if (visits.Count == 0)
            return new OpenDispatchResult(0, 0);

        var expiryDays = _jobOptions.DispatchOfferExpiryDays;
        var now = DateTime.UtcNow;
        var opened = 0;
        var autoAssigned = 0;
        foreach (var visit in visits)
        {
            if (await TryAutoAssignPreferredProviderAsync(visit, ct))
            {
                autoAssigned++;
                continue;
            }

            visit.Status = VisitStatus.OpenForClaim;
            db.DispatchOffers.Add(new DispatchOffer
            {
                JobVisitId = visit.Id,
                Status = DispatchOfferStatus.Open,
                ExpiresAtUtc = now.AddDays(expiryDays)
            });
            opened++;

            if (visit.DispatchNotifiedAtUtc is null)
            {
                await NotifyProvidersOfDispatchAsync(visit, ct);
                visit.DispatchNotifiedAtUtc = now;
            }
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "dispatch",
            "visits_opened",
            null,
            null,
            new { count = opened, autoAssigned },
            ct);

        return new OpenDispatchResult(opened, autoAssigned);
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

            await communications.NotifyVisitReminderAsync(
                customer.Email, customer.Phone, customer.FirstName, visit.ScheduledDate, postcode, window, ct);

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
        var intervalDays = PlanCatalog.VisitIntervalDays(sub.Plan.Name);
        var created = new List<JobVisit>(count);
        for (var i = 0; i < count; i++)
        {
            var visit = new JobVisit
            {
                CustomerSubscriptionId = sub.Id,
                CustomerPropertyId = property.Id,
                ScheduledDate = startDate.AddDays(i * intervalDays),
                AvailabilityWindow = sub.AvailabilityPreference,
                Status = VisitStatus.Scheduled
            };
            db.JobVisits.Add(visit);
            created.Add(visit);
        }

        await db.SaveChangesAsync(ct);

        var autoAssigned = 0;
        foreach (var visit in created)
        {
            if (await TryAutoAssignPreferredProviderAsync(visit, ct))
                autoAssigned++;
        }

        await workflow.LogAsync(
            "scheduling",
            "visits_generated",
            nameof(CustomerSubscription),
            sub.Id,
            new { count, startDate = startDate.ToString("yyyy-MM-dd"), autoAssigned },
            ct);

        if (sub.VisitScheduleEmailSentAtUtc is null)
        {
            var user = sub.Customer.User;
            await communications.NotifyVisitScheduledAsync(
                user.Email,
                user.FirstName,
                created.Select(v => v.ScheduledDate).ToList(),
                ct);
            sub.VisitScheduleEmailSentAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }
    }

    private async Task NotifyProvidersOfDispatchAsync(JobVisit visit, CancellationToken ct)
    {
        var property = await db.CustomerProperties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == visit.CustomerPropertyId, ct);
        if (property is null) return;

        var outcode = PostcodeFormat.Outcode(property.Postcode);
        var providerIds = await db.ProviderTerritories
            .Where(t => t.PostcodeSector == outcode && !t.IsDeleted)
            .Select(t => t.ProviderId)
            .Distinct()
            .ToListAsync(ct);

        if (providerIds.Count == 0) return;

        var providers = await db.Providers
            .Include(p => p.User)
            .Where(p => providerIds.Contains(p.Id) && p.IsApproved && !p.IsDeleted)
            .ToListAsync(ct);

        foreach (var provider in providers)
        {
            await communications.NotifyProviderDispatchAsync(
                provider.User.Email,
                provider.User.Phone,
                visit.ScheduledDate,
                outcode,
                visit.AvailabilityWindow,
                ct);
        }
    }

    private async Task<bool> TryAutoAssignPreferredProviderAsync(JobVisit visit, CancellationToken ct)
    {
        if (visit.Status is not (VisitStatus.Scheduled or VisitStatus.OpenForClaim))
            return false;

        var preferredProviderId = await db.CustomerSubscriptions
            .Where(s => s.Id == visit.CustomerSubscriptionId && !s.IsDeleted)
            .Select(s => s.PreferredProviderId)
            .FirstOrDefaultAsync(ct);
        if (preferredProviderId is null)
            return false;

        var provider = await db.Providers
            .Include(p => p.Territories)
            .FirstOrDefaultAsync(p => p.Id == preferredProviderId && p.IsApproved && !p.IsDeleted, ct);
        if (provider is null)
            return false;

        var property = await db.CustomerProperties
            .FirstOrDefaultAsync(p => p.Id == visit.CustomerPropertyId && !p.IsDeleted, ct);
        if (property is null)
            return false;

        if (!await coverage.IsPropertyWithinCoverageAsync(provider, property, ct))
            return false;

        if (!await availability.IsAvailableAsync(provider, visit.ScheduledDate, visit.AvailabilityWindow, ct))
            return false;

        var conflict = await db.JobVisits.AnyAsync(v =>
            v.AssignedProviderId == provider.Id
            && v.ScheduledDate == visit.ScheduledDate
            && v.Id != visit.Id
            && v.Status != VisitStatus.Cancelled
            && !v.IsDeleted, ct);
        if (conflict)
            return false;

        visit.Status = VisitStatus.Claimed;
        visit.AssignedProviderId = provider.Id;
        visit.ClaimedAtUtc = DateTime.UtcNow;
        visit.UpdatedAtUtc = DateTime.UtcNow;

        var offer = await db.DispatchOffers.FirstOrDefaultAsync(o => o.JobVisitId == visit.Id && !o.IsDeleted, ct);
        if (offer is not null)
            offer.Status = DispatchOfferStatus.Claimed;

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "dispatch",
            "preferred_provider_assigned",
            nameof(JobVisit),
            visit.Id,
            new { providerId = provider.Id },
            ct);
        return true;
    }

    public async Task AssignPreferredProviderToPendingVisitsAsync(Guid subscriptionId, CancellationToken ct = default)
    {
        var today = DateTime.UtcNow.Date;
        var visits = await db.JobVisits
            .Where(v =>
                v.CustomerSubscriptionId == subscriptionId
                && !v.IsDeleted
                && v.AssignedProviderId == null
                && v.ScheduledDate >= today
                && (v.Status == VisitStatus.Scheduled || v.Status == VisitStatus.OpenForClaim))
            .ToListAsync(ct);

        if (visits.Count == 0)
            return;

        var assigned = 0;
        foreach (var visit in visits)
        {
            if (await TryAutoAssignPreferredProviderAsync(visit, ct))
                assigned++;
        }

        if (assigned > 0)
            logger.LogInformation(
                "Auto-assigned preferred provider to {Count} pending visits for subscription {SubscriptionId}",
                assigned,
                subscriptionId);
    }

    private async Task<CustomerSubscription?> LoadSubscriptionAsync(Guid subscriptionId, CancellationToken ct)
        => await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Customer).ThenInclude(c => c.Properties)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && !s.IsDeleted, ct);

    private static CustomerProperty ResolveProperty(CustomerSubscription sub)
        => sub.Customer.Properties.FirstOrDefault(p => p.IsPrimary && !p.IsDeleted)
            ?? sub.Customer.Properties.FirstOrDefault(p => !p.IsDeleted)
            ?? throw new InvalidOperationException("No property on subscription.");

    public static string PostcodeSector(string postcode) => PostcodeFormat.Outcode(postcode);

    public async Task ReleaseVisitToOpenPoolAsync(Guid visitId, CancellationToken ct = default)
    {
        var visit = await db.JobVisits
            .Include(v => v.Property)
            .FirstOrDefaultAsync(v => v.Id == visitId && !v.IsDeleted, ct)
            ?? throw new InvalidOperationException("Visit not found.");

        if (visit.Status is not (VisitStatus.Claimed or VisitStatus.Scheduled))
            throw new InvalidOperationException("Only claimed or scheduled visits can be released to the open pool.");

        var now = DateTime.UtcNow;
        var expiryDays = _jobOptions.DispatchOfferExpiryDays;
        var offer = await db.DispatchOffers.FirstOrDefaultAsync(o => o.JobVisitId == visit.Id && !o.IsDeleted, ct);

        visit.Status = VisitStatus.OpenForClaim;
        visit.AssignedProviderId = null;
        visit.ClaimedAtUtc = null;
        visit.UpdatedAtUtc = now;

        if (offer is not null)
        {
            offer.Status = DispatchOfferStatus.Open;
            offer.ExpiresAtUtc = now.AddDays(expiryDays);
            offer.UpdatedAtUtc = now;
        }
        else
        {
            db.DispatchOffers.Add(new DispatchOffer
            {
                JobVisitId = visit.Id,
                Status = DispatchOfferStatus.Open,
                ExpiresAtUtc = now.AddDays(expiryDays),
            });
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "dispatch",
            "visit_released_to_open_pool",
            nameof(JobVisit),
            visit.Id,
            null,
            ct);

        if (visit.DispatchNotifiedAtUtc is null)
        {
            await NotifyProvidersOfDispatchAsync(visit, ct);
            visit.DispatchNotifiedAtUtc = now;
            await db.SaveChangesAsync(ct);
        }
    }

    public async Task AdminAssignVisitAsync(Guid visitId, Guid providerId, CancellationToken ct = default)
    {
        var visit = await db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.Subscription).ThenInclude(s => s.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(v => v.Id == visitId && !v.IsDeleted, ct)
            ?? throw new InvalidOperationException("Visit not found.");

        if (visit.Status is not (VisitStatus.OpenForClaim or VisitStatus.Scheduled))
            throw new InvalidOperationException("Only open or scheduled visits can be assigned.");

        var provider = await db.Providers
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.Id == providerId && p.IsApproved && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException("Approved provider not found.");

        if (!await coverage.IsPropertyWithinCoverageAsync(provider, visit.Property, ct))
            throw new InvalidOperationException("Visit is outside the provider's coverage area.");

        if (!await availability.IsAvailableAsync(provider, visit.ScheduledDate, visit.AvailabilityWindow, ct))
            throw new InvalidOperationException("Provider is unavailable on this date or time window.");

        var conflict = await db.JobVisits.AnyAsync(v =>
            v.AssignedProviderId == provider.Id
            && v.ScheduledDate == visit.ScheduledDate
            && v.Id != visit.Id
            && v.Status != VisitStatus.Cancelled
            && !v.IsDeleted, ct);
        if (conflict)
            throw new InvalidOperationException("Provider already has a visit on this date.");

        visit.Status = VisitStatus.Claimed;
        visit.AssignedProviderId = provider.Id;
        visit.ClaimedAtUtc = DateTime.UtcNow;
        visit.UpdatedAtUtc = DateTime.UtcNow;

        var offer = await db.DispatchOffers.FirstOrDefaultAsync(o => o.JobVisitId == visit.Id && !o.IsDeleted, ct);
        if (offer is not null)
            offer.Status = DispatchOfferStatus.Claimed;

        await db.SaveChangesAsync(ct);

        var customer = visit.Subscription.Customer.User;
        await communications.NotifyVisitClaimedAsync(
            customer.Email,
            customer.Phone,
            customer.FirstName,
            visit.ScheduledDate,
            visit.Property.Postcode,
            visit.AvailabilityWindow,
            ct);

        await workflow.LogAsync(
            "dispatch",
            "admin_assigned_provider",
            nameof(JobVisit),
            visit.Id,
            new { providerId = provider.Id },
            ct);
    }
}
