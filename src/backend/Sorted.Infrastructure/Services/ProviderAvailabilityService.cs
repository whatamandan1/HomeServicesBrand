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

public class ProviderAvailabilityService(
    SortedDbContext db,
    IOptions<BackgroundJobsOptions> jobOptions) : IProviderAvailabilityService
{
    private readonly BackgroundJobsOptions _jobOptions = jobOptions.Value;

    public Task<bool> IsAvailableAsync(
        Provider provider,
        DateTime scheduledDate,
        string? customerAvailabilityWindow = null,
        CancellationToken ct = default)
    {
        var visitDate = VisitCalendar.ToVisitDate(scheduledDate);
        if (!ProviderWorkingDays.IsWorkingDay(provider.WorkingDaysMask, visitDate.DayOfWeek))
            return Task.FromResult(false);

        if (!CustomerAvailabilityWindow.OverlapsProviderHours(
                customerAvailabilityWindow,
                provider.WorkDayStartMinutes,
                provider.WorkDayEndMinutes))
        {
            return Task.FromResult(false);
        }

        return IsCalendarDayOpenAsync(provider, visitDate, ct);
    }

    private async Task<bool> IsCalendarDayOpenAsync(Provider provider, DateOnly visitDate, CancellationToken ct)
        => !await db.ProviderBlockedDates.AsNoTracking()
            .AnyAsync(b => b.ProviderId == provider.Id && !b.IsDeleted && b.BlockedDate == visitDate, ct);

    public async Task<ProviderAvailabilityResponse> GetAvailabilityAsync(Guid providerId, CancellationToken ct = default)
    {
        var provider = await db.Providers.AsNoTracking()
            .Include(p => p.BlockedDates.Where(b => !b.IsDeleted))
            .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException("Provider not found.");

        return MapResponse(provider);
    }

    public async Task<ProviderAvailabilityResponse> UpdateAvailabilityAsync(
        Guid providerId,
        UpdateProviderAvailabilityRequest request,
        CancellationToken ct = default)
    {
        if (request.WorkingDaysMask <= 0 || request.WorkingDaysMask > 127)
            throw new InvalidOperationException("Select at least one working day.");

        var startMinutes = ProviderWorkHours.ParseMinutes(request.WorkDayStart);
        var endMinutes = ProviderWorkHours.ParseMinutes(request.WorkDayEnd);
        if (endMinutes <= startMinutes)
            throw new InvalidOperationException("End time must be after start time.");

        var provider = await db.Providers
            .Include(p => p.BlockedDates.Where(b => !b.IsDeleted))
            .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException("Provider not found.");

        provider.WorkingDaysMask = request.WorkingDaysMask;
        provider.WorkDayStartMinutes = startMinutes;
        provider.WorkDayEndMinutes = endMinutes;
        provider.UpdatedAtUtc = DateTime.UtcNow;

        await ReleaseConflictingAssignedVisitsAsync(providerId, ct);
        await db.SaveChangesAsync(ct);

        return MapResponse(provider);
    }

    public async Task<ProviderBlockedDateResponse> AddBlockedDateAsync(
        Guid providerId,
        AddProviderBlockedDateRequest request,
        CancellationToken ct = default)
    {
        if (!DateOnly.TryParse(request.BlockedDate, out var blockedDate))
            throw new InvalidOperationException("Enter a valid date (YYYY-MM-DD).");

        if (blockedDate < DateOnly.FromDateTime(DateTime.UtcNow.Date))
            throw new InvalidOperationException("Blocked dates must be today or in the future.");

        var provider = await db.Providers.FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException("Provider not found.");

        var exists = await db.ProviderBlockedDates.AnyAsync(
            b => b.ProviderId == providerId && !b.IsDeleted && b.BlockedDate == blockedDate,
            ct);
        if (exists)
            throw new InvalidOperationException("That date is already blocked.");

        var entry = new ProviderBlockedDate
        {
            ProviderId = providerId,
            BlockedDate = blockedDate,
            Reason = string.IsNullOrWhiteSpace(request.Reason) ? null : request.Reason.Trim(),
        };
        db.ProviderBlockedDates.Add(entry);

        var releasedVisitCount = await ReleaseAssignedVisitsOnDateAsync(providerId, blockedDate, ct);

        await db.SaveChangesAsync(ct);

        return new ProviderBlockedDateResponse(
            entry.Id,
            entry.BlockedDate.ToString("yyyy-MM-dd"),
            entry.Reason,
            releasedVisitCount);
    }

    public async Task RemoveBlockedDateAsync(Guid providerId, Guid blockedDateId, CancellationToken ct = default)
    {
        var entry = await db.ProviderBlockedDates
            .FirstOrDefaultAsync(b => b.Id == blockedDateId && b.ProviderId == providerId && !b.IsDeleted, ct)
            ?? throw new InvalidOperationException("Blocked date not found.");

        entry.IsDeleted = true;
        entry.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    public async Task<int> ReleaseConflictingAssignedVisitsAsync(Guid providerId, CancellationToken ct = default)
    {
        var provider = await db.Providers.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException("Provider not found.");

        var blockedDates = await db.ProviderBlockedDates.AsNoTracking()
            .Where(b => b.ProviderId == providerId && !b.IsDeleted)
            .Select(b => b.BlockedDate)
            .ToListAsync(ct);

        var visits = await LoadAssignedMutableVisitsAsync(providerId, ct);
        var toRelease = visits
            .Where(v => VisitCalendar.ConflictsWithAvailability(
                v.ScheduledDate,
                provider.WorkingDaysMask,
                blockedDates,
                provider.WorkDayStartMinutes,
                provider.WorkDayEndMinutes,
                v.AvailabilityWindow))
            .ToList();

        return await ReleaseVisitsAsync(toRelease, ct);
    }

    private async Task<int> ReleaseAssignedVisitsOnDateAsync(
        Guid providerId,
        DateOnly blockedDate,
        CancellationToken ct)
    {
        var visits = await LoadAssignedMutableVisitsAsync(providerId, ct);
        var toRelease = visits
            .Where(v => VisitCalendar.ToVisitDate(v.ScheduledDate) == blockedDate)
            .ToList();

        return await ReleaseVisitsAsync(toRelease, ct);
    }

    private async Task<List<JobVisit>> LoadAssignedMutableVisitsAsync(Guid providerId, CancellationToken ct)
    {
        var today = DateTime.UtcNow.Date;
        return await db.JobVisits
            .Where(v =>
                v.AssignedProviderId == providerId
                && !v.IsDeleted
                && v.ScheduledDate >= today
                && (v.Status == VisitStatus.Claimed
                    || v.Status == VisitStatus.InProgress
                    || v.Status == VisitStatus.Rescheduled))
            .ToListAsync(ct);
    }

    private async Task<int> ReleaseVisitsAsync(IReadOnlyList<JobVisit> visits, CancellationToken ct)
    {
        if (visits.Count == 0)
            return 0;

        var now = DateTime.UtcNow;
        var expiryDays = _jobOptions.DispatchOfferExpiryDays;
        var visitIds = visits.Select(v => v.Id).ToList();
        var offers = await db.DispatchOffers
            .Where(o => visitIds.Contains(o.JobVisitId) && !o.IsDeleted)
            .ToDictionaryAsync(o => o.JobVisitId, ct);

        foreach (var visit in visits)
        {
            visit.Status = VisitStatus.OpenForClaim;
            visit.AssignedProviderId = null;
            visit.ClaimedAtUtc = null;
            visit.UpdatedAtUtc = now;

            if (offers.TryGetValue(visit.Id, out var offer))
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
        }

        return visits.Count;
    }

    private static ProviderAvailabilityResponse MapResponse(Provider provider)
    {
        var blocked = provider.BlockedDates
            .Where(b => !b.IsDeleted)
            .OrderBy(b => b.BlockedDate)
            .Select(b => new ProviderBlockedDateResponse(b.Id, b.BlockedDate.ToString("yyyy-MM-dd"), b.Reason))
            .ToList();

        return new ProviderAvailabilityResponse(
            provider.WorkingDaysMask,
            ProviderWorkHours.FormatMinutes(provider.WorkDayStartMinutes),
            ProviderWorkHours.FormatMinutes(provider.WorkDayEndMinutes),
            blocked);
    }
}
