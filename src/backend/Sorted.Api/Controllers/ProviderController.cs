using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Infrastructure.Data;
using Sorted.Infrastructure.Services;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/provider")]
[Authorize(Roles = nameof(UserRole.Provider))]
public class ProviderController(SortedDbContext db) : ControllerBase
{
    private async Task<Provider?> GetProviderAsync(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await db.Providers
            .Include(p => p.Territories)
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct);
    }

    [HttpGet("visits/open")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> OpenVisits(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();
        if (!provider.IsApproved) return Forbid();

        var sectors = provider.Territories.Select(t => t.PostcodeSector).ToList();
        var visits = await db.JobVisits.AsNoTracking()
            .Where(v => v.Status == VisitStatus.OpenForClaim && !v.IsDeleted)
            .Where(v => sectors.Contains(VisitSchedulingService.PostcodeSector(v.Property.Postcode)))
            .OrderBy(v => v.ScheduledDate)
            .Select(v => new JobVisitResponse(v.Id, v.ScheduledDate, v.AvailabilityWindow, v.Status, v.Property.Postcode, null))
            .ToListAsync(ct);
        return Ok(visits);
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
            .FirstOrDefaultAsync(v => v.Id == request.VisitId && v.Status == VisitStatus.OpenForClaim, ct);
        if (visit is null) return NotFound();

        var sectors = provider.Territories.Select(t => t.PostcodeSector).ToList();
        if (!sectors.Contains(VisitSchedulingService.PostcodeSector(visit.Property.Postcode)))
            return BadRequest(new { error = "Visit is outside your territory." });

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

        return Ok(new JobVisitResponse(visit.Id, visit.ScheduledDate, visit.AvailabilityWindow, visit.Status, visit.Property.Postcode, provider.User.FirstName + " " + provider.User.LastName));
    }

    [HttpGet("visits/mine")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> MyVisits(CancellationToken ct)
    {
        var provider = await GetProviderAsync(ct);
        if (provider is null) return NotFound();

        var visits = await db.JobVisits.AsNoTracking()
            .Where(v => v.AssignedProviderId == provider.Id && !v.IsDeleted)
            .OrderBy(v => v.ScheduledDate)
            .Select(v => new JobVisitResponse(v.Id, v.ScheduledDate, v.AvailabilityWindow, v.Status, v.Property.Postcode, provider.User.FirstName + " " + provider.User.LastName))
            .ToListAsync(ct);
        return Ok(visits);
    }
}
