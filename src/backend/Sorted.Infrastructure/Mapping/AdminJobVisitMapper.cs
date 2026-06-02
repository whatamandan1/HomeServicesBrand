using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Enums;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Mapping;

public static class AdminJobVisitMapper
{
    public static async Task<IReadOnlyList<AdminJobVisitResponse>> LoadAsync(
        SortedDbContext db,
        VisitStatus? status,
        DateTime? fromDate,
        DateTime? toDate,
        int limit,
        CancellationToken ct = default)
    {
        var query = db.JobVisits.AsNoTracking().Where(v => !v.IsDeleted);

        if (status is VisitStatus visitStatus)
            query = query.Where(v => v.Status == visitStatus);
        if (fromDate is DateTime from)
            query = query.Where(v => v.ScheduledDate >= from);
        if (toDate is DateTime to)
            query = query.Where(v => v.ScheduledDate <= to);

        var rows = await query
            .OrderByDescending(v => v.ScheduledDate)
            .Take(limit)
            .Select(v => new VisitRow(
                v.Id,
                v.ScheduledDate,
                v.AvailabilityWindow,
                v.Status,
                v.CustomerPropertyId,
                v.CustomerSubscriptionId,
                v.AssignedProviderId,
                v.ClaimedAtUtc,
                v.DispatchNotifiedAtUtc))
            .ToListAsync(ct);

        if (rows.Count == 0)
            return [];

        var propertyIds = rows.Select(r => r.PropertyId).Distinct().ToList();
        var properties = await db.CustomerProperties.AsNoTracking()
            .Where(p => propertyIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, ct);

        var subscriptionIds = rows.Select(r => r.SubscriptionId).Distinct().ToList();
        var subscriptionCustomers = await db.CustomerSubscriptions.AsNoTracking()
            .Where(s => subscriptionIds.Contains(s.Id))
            .Select(s => new { s.Id, s.CustomerId })
            .ToListAsync(ct);
        var subscriptionCustomerMap = subscriptionCustomers.ToDictionary(s => s.Id, s => s.CustomerId);

        var customerIds = subscriptionCustomers.Select(s => s.CustomerId).Distinct().ToList();
        var customerNames = await db.Customers.AsNoTracking()
            .Where(c => customerIds.Contains(c.Id))
            .Select(c => new
            {
                c.Id,
                Name = c.User.FirstName + " " + c.User.LastName
            })
            .ToDictionaryAsync(c => c.Id, c => c.Name.Trim(), ct);

        var providerIds = rows
            .Where(r => r.AssignedProviderId is not null)
            .Select(r => r.AssignedProviderId!.Value)
            .Distinct()
            .ToList();

        var providerNames = providerIds.Count == 0
            ? new Dictionary<Guid, string>()
            : await db.Providers.AsNoTracking()
                .Where(p => providerIds.Contains(p.Id))
                .Select(p => new
                {
                    p.Id,
                    Name = p.User.FirstName + " " + p.User.LastName
                })
                .ToDictionaryAsync(p => p.Id, p => p.Name.Trim(), ct);

        var visitIds = rows.Select(r => r.Id).ToList();
        var offers = await db.DispatchOffers.AsNoTracking()
            .Where(o => visitIds.Contains(o.JobVisitId) && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAtUtc)
            .ToListAsync(ct);
        var offerByVisit = offers
            .GroupBy(o => o.JobVisitId)
            .ToDictionary(g => g.Key, g => g.First());

        var now = DateTime.UtcNow;
        return rows.Select(row =>
        {
            properties.TryGetValue(row.PropertyId, out var property);
            string? customerName = null;
            if (subscriptionCustomerMap.TryGetValue(row.SubscriptionId, out var customerId))
                customerNames.TryGetValue(customerId, out customerName);

            string? providerName = null;
            if (row.AssignedProviderId is Guid providerId)
                providerNames.TryGetValue(providerId, out providerName);

            offerByVisit.TryGetValue(row.Id, out var offer);
            int? daysOpen = null;
            if (row.Status == VisitStatus.OpenForClaim && row.DispatchNotifiedAtUtc is DateTime openedAt)
                daysOpen = Math.Max(0, (int)(now - openedAt).TotalDays);

            return new AdminJobVisitResponse(
                row.Id,
                row.ScheduledDate,
                row.AvailabilityWindow,
                row.Status,
                property?.Postcode ?? "-",
                subscriptionCustomerMap.TryGetValue(row.SubscriptionId, out var mappedCustomerId)
                    ? mappedCustomerId
                    : null,
                customerName,
                providerName,
                row.AssignedProviderId,
                property?.Latitude,
                property?.Longitude,
                offer?.ExpiresAtUtc,
                offer?.Status.ToString(),
                row.ClaimedAtUtc,
                row.DispatchNotifiedAtUtc,
                daysOpen);
        }).ToList();
    }

    private sealed record VisitRow(
        Guid Id,
        DateTime ScheduledDate,
        string AvailabilityWindow,
        VisitStatus Status,
        Guid PropertyId,
        Guid SubscriptionId,
        Guid? AssignedProviderId,
        DateTime? ClaimedAtUtc,
        DateTime? DispatchNotifiedAtUtc);
}
