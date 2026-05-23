using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Interfaces;
using Sorted.Core.Enums;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/provider")]
[Authorize(Roles = nameof(UserRole.Provider))]
public class ProviderController(
    SortedDbContext db,
    IEmailService email,
    ISmsService sms,
    IWorkflowLogger workflow,
    IProviderCoverageService coverage) : ControllerBase
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
        return Ok(new ProviderProfileResponse(
            provider.User.Email,
            provider.IsApproved,
            provider.CoveragePostcode,
            provider.CoverageRadiusMiles,
            provider.Territories
                .Where(t => !t.IsDeleted)
                .Select(t => t.PostcodeSector)
                .OrderBy(s => s, StringComparer.OrdinalIgnoreCase)
                .ToList()));
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

            filtered.Add(new JobVisitResponse(
                visit.Id,
                visit.ScheduledDate,
                visit.AvailabilityWindow,
                visit.Status,
                visit.Property.Postcode,
                null));
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

        return Ok(new JobVisitResponse(visit.Id, visit.ScheduledDate, visit.AvailabilityWindow, visit.Status, visit.Property.Postcode, provider.User.FirstName + " " + provider.User.LastName));
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
        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("dispatch", workflowEvent, nameof(JobVisit), visit.Id, new { visit.Status }, ct);

        return Ok(new JobVisitResponse(
            visit.Id,
            visit.ScheduledDate,
            visit.AvailabilityWindow,
            visit.Status,
            visit.Property.Postcode,
            provider.User.FirstName + " " + provider.User.LastName));
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
