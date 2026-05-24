using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Interfaces;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Infrastructure.Data;
using Sorted.Infrastructure.Mapping;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/provider")]
[Authorize(Roles = nameof(UserRole.Provider))]
public class ProviderController(
    SortedDbContext db,
    IEmailService email,
    ISmsService sms,
    IWorkflowLogger workflow,
    IProviderCoverageService coverage,
    IProviderAvailabilityService availability,
    IProviderEarningsService earnings,
    IPostcodeGeocodingService geocoding,
    IVisitSchedulingService scheduling) : ControllerBase
{
    private async Task<Provider?> GetProviderAsync(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await db.Providers
            .Include(p => p.Territories)
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
    }

    [HttpGet("me")]
    public async Task<ActionResult<ProviderProfileResponse>> Profile(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        if (provider.CoverageLatitude is null
            && provider.CoverageLongitude is null
            && !string.IsNullOrWhiteSpace(provider.CoveragePostcode))
        {
            var geo = await geocoding.LookupAsync(provider.CoveragePostcode, ct);
            if (geo is not null)
            {
                provider.CoveragePostcode = geo.Postcode;
                provider.CoverageLatitude = geo.Latitude;
                provider.CoverageLongitude = geo.Longitude;
                provider.UpdatedAtUtc = DateTime.UtcNow;
                await db.SaveChangesAsync(ct);
            }
        }

        return Ok(new ProviderProfileResponse(
            provider.User.Email,
            provider.IsApproved,
            provider.CoveragePostcode,
            provider.CoverageRadiusMiles,
            provider.Territories
                .Where(t => !t.IsDeleted)
                .Select(t => t.PostcodeSector)
                .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
                .ToList(),
            provider.CoverageLatitude,
            provider.CoverageLongitude));
    }

    [HttpPatch("me/coverage")]
    public async Task<ActionResult<ProviderProfileResponse>> UpdateCoverage(
        [FromBody] UpdateProviderCoverageRequest request,
        CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        var radius = request.CoverageRadiusMiles;
        if (radius is < 1 or > 50)
            return BadRequest(new { error = "Coverage radius must be between 1 and 50 miles." });

        var geo = await geocoding.LookupAsync(PostcodeFormat.Normalize(request.CoveragePostcode), ct);
        if (geo is null)
            return BadRequest(new { error = "Could not find that postcode. Check it is a valid UK postcode." });

        provider.CoveragePostcode = geo.Postcode;
        provider.CoverageLatitude = geo.Latitude;
        provider.CoverageLongitude = geo.Longitude;
        provider.CoverageRadiusMiles = radius;
        provider.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        coverage.ScheduleTerritoryResync(provider.Id);

        await workflow.LogAsync(
            "provider_onboarding",
            "coverage_updated",
            nameof(Provider),
            provider.Id,
            new { geo.Postcode, radius, updatedBy = "provider" },
            ct);

        return Ok(new ProviderProfileResponse(
            provider.User.Email,
            provider.IsApproved,
            provider.CoveragePostcode,
            provider.CoverageRadiusMiles,
            provider.Territories
                .Where(t => !t.IsDeleted)
                .Select(t => t.PostcodeSector)
                .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
                .ToList(),
            provider.CoverageLatitude,
            provider.CoverageLongitude));
    }

    [HttpGet("me/availability")]
    public async Task<ActionResult<ProviderAvailabilityResponse>> Availability(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        try
        {
            return Ok(await availability.GetAvailabilityAsync(provider.Id, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPut("me/availability")]
    public async Task<ActionResult<ProviderAvailabilityResponse>> UpdateAvailability(
        [FromBody] UpdateProviderAvailabilityRequest request,
        CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        try
        {
            var updated = await availability.UpdateAvailabilityAsync(provider.Id, request, ct);
            await workflow.LogAsync(
                "provider_onboarding",
                "availability_updated",
                nameof(Provider),
                provider.Id,
                new { request.WorkingDaysMask, request.WorkDayStart, request.WorkDayEnd },
                ct);
            return Ok(updated);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("me/blocked-dates")]
    public async Task<ActionResult<ProviderBlockedDateResponse>> AddBlockedDate(
        [FromBody] AddProviderBlockedDateRequest request,
        CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        try
        {
            return Ok(await availability.AddBlockedDateAsync(provider.Id, request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("me/blocked-dates/{blockedDateId:guid}")]
    public async Task<IActionResult> RemoveBlockedDate(Guid blockedDateId, CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        try
        {
            await availability.RemoveBlockedDateAsync(provider.Id, blockedDateId, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("earnings")]
    public async Task<ActionResult<ProviderEarningsSummaryResponse>> Earnings(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        return Ok(await earnings.GetProviderEarningsAsync(provider.Id, ct));
    }

    [HttpGet("visits/open")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> OpenVisits(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();
        if (!provider.IsApproved) return Forbid();

        var visits = await db.JobVisits.AsNoTracking()
            .Include(v => v.Property)
            .Where(v => v.Status == VisitStatus.OpenForClaim && !v.IsDeleted)
            .OrderBy(v => v.ScheduledDate)
            .ToListAsync(ct);

        var filtered = new List<JobVisitResponse>();
        foreach (var visit in visits)
        {
            if (!await coverage.IsPropertyWithinCoverageAsync(provider, visit.Property, ct))
                continue;

            if (!await availability.IsAvailableAsync(provider, visit.ScheduledDate, ct))
                continue;

            filtered.Add(JobVisitResponseMapper.FromEntity(visit));
        }

        return Ok(filtered);
    }

    [HttpPost("visits/claim")]
    public async Task<ActionResult<JobVisitResponse>> ClaimVisit([FromBody] ClaimVisitRequest request, CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();
        if (!provider.IsApproved) return Forbid();

        var visit = await db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.AssignedProvider)
            .Include(v => v.Subscription).ThenInclude(s => s.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(v => v.Id == request.VisitId && v.Status == VisitStatus.OpenForClaim, ct);
        if (visit is null) return NotFound();

        if (!await coverage.IsPropertyWithinCoverageAsync(provider, visit.Property, ct))
            return BadRequest(new { error = "Visit is outside your coverage area." });

        if (!await availability.IsAvailableAsync(provider, visit.ScheduledDate, ct))
            return BadRequest(new { error = "This visit falls on a day you have marked unavailable." });

        var conflict = await db.JobVisits.AnyAsync(v =>
            v.AssignedProviderId == provider.Id &&
            v.ScheduledDate == visit.ScheduledDate &&
            v.Status != VisitStatus.Cancelled &&
            !v.IsDeleted, ct);
        if (conflict)
            return Conflict(new { error = "You already have a visit on this date." });

        visit.Status = VisitStatus.Claimed;
        visit.AssignedProviderId = provider.Id;
        visit.ClaimedAtUtc = DateTime.UtcNow;

        var offer = await db.DispatchOffers.FirstOrDefaultAsync(o => o.JobVisitId == visit.Id, ct);
        if (offer is not null) offer.Status = DispatchOfferStatus.Claimed;

        await db.SaveChangesAsync(ct);

        var customer = visit.Subscription.Customer.User;
        await email.SendVisitClaimedEmailAsync(
            customer.Email,
            visit.ScheduledDate,
            visit.Property.Postcode,
            visit.AvailabilityWindow,
            ct);

        if (!string.IsNullOrWhiteSpace(customer.Phone))
        {
            await sms.SendVisitClaimedSmsAsync(
                customer.Phone,
                visit.ScheduledDate,
                visit.Property.Postcode,
                ct);
        }

        return Ok(JobVisitResponseMapper.FromEntity(visit, provider.User.FirstName + " " + provider.User.LastName));
    }

    [HttpPost("visits/{visitId:guid}/start")]
    public async Task<ActionResult<JobVisitResponse>> StartVisit(Guid visitId, CancellationToken ct)
        => await UpdateVisitStatusAsync(visitId, VisitStatus.Claimed, VisitStatus.InProgress, "visit_started", ct);

    [HttpPost("visits/{visitId:guid}/complete")]
    public async Task<ActionResult<JobVisitResponse>> CompleteVisit(Guid visitId, CancellationToken ct)
        => await UpdateVisitStatusAsync(visitId, VisitStatus.InProgress, VisitStatus.Completed, "visit_completed", ct);

    private async Task<ActionResult<JobVisitResponse>> UpdateVisitStatusAsync(
        Guid visitId,
        VisitStatus requiredStatus,
        VisitStatus newStatus,
        string workflowEvent,
        CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();
        if (!provider.IsApproved) return Forbid();

        var visit = await db.JobVisits
            .Include(v => v.Property)
            .FirstOrDefaultAsync(v => v.Id == visitId && v.AssignedProviderId == provider.Id && !v.IsDeleted, ct);

        if (visit is null)
            return NotFound(new { error = "Visit not found or not assigned to you." });

        if (visit.Status != requiredStatus)
        {
            return BadRequest(new
            {
                error = newStatus == VisitStatus.InProgress
                    ? "Only claimed visits can be started."
                    : "Only in-progress visits can be completed."
            });
        }

        visit.Status = newStatus;
        visit.UpdatedAtUtc = DateTime.UtcNow;

        if (newStatus == VisitStatus.Completed)
        {
            var subscription = await db.CustomerSubscriptions
                .FirstOrDefaultAsync(s => s.Id == visit.CustomerSubscriptionId && !s.IsDeleted, ct);
            if (subscription?.PreferredProviderId is null)
            {
                subscription!.PreferredProviderId = provider.Id;
                subscription.UpdatedAtUtc = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("dispatch", workflowEvent, nameof(JobVisit), visit.Id, new { visit.Status }, ct);

        if (newStatus == VisitStatus.Completed)
        {
            await earnings.AccrueForCompletedVisitAsync(visit.Id, provider.Id, ct);
            await scheduling.AssignPreferredProviderToPendingVisitsAsync(visit.CustomerSubscriptionId, ct);
        }

        return Ok(JobVisitResponseMapper.FromEntity(visit, provider.User.FirstName + " " + provider.User.LastName));
    }

    [HttpGet("visits/mine")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> MyVisits(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        await availability.ReleaseConflictingAssignedVisitsAsync(provider.Id, ct);

        var visits = await db.JobVisits.AsNoTracking()
            .Include(v => v.Property)
            .Where(v => v.AssignedProviderId == provider.Id && !v.IsDeleted)
            .OrderBy(v => v.ScheduledDate)
            .ToListAsync(ct);

        return Ok(visits.Select(v => JobVisitResponseMapper.FromEntity(v, provider.User.FirstName + " " + provider.User.LastName)));
    }
}
