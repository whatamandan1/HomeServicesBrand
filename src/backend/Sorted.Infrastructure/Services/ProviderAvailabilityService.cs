using Microsoft.EntityFrameworkCore;
using Sorted.Core;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class ProviderAvailabilityService(SortedDbContext db) : IProviderAvailabilityService
{
    public async Task<bool> IsAvailableAsync(Provider provider, DateTime scheduledDate, CancellationToken ct = default)
    {
        var date = DateOnly.FromDateTime(scheduledDate.Date);
        if (!ProviderWorkingDays.IsWorkingDay(provider.WorkingDaysMask, scheduledDate.DayOfWeek))
            return false;

        if (provider.BlockedDates.Count > 0)
        {
            if (provider.BlockedDates.Any(b => !b.IsDeleted && b.BlockedDate == date))
                return false;
        }
        else
        {
            var blocked = await db.ProviderBlockedDates.AsNoTracking()
                .AnyAsync(b => b.ProviderId == provider.Id && !b.IsDeleted && b.BlockedDate == date, ct);
            if (blocked)
                return false;
        }

        return true;
    }

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
        await db.SaveChangesAsync(ct);

        return new ProviderBlockedDateResponse(entry.Id, entry.BlockedDate.ToString("yyyy-MM-dd"), entry.Reason);
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
