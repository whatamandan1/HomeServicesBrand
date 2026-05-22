using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class AdminController(
    SortedDbContext db,
    IVisitSchedulingService scheduling,
    IVisitManagementService visits,
    IWorkflowLogger workflow) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardResponse>> Dashboard(CancellationToken ct)
    {
        var customers = await db.Customers.CountAsync(c => !c.IsDeleted, ct);
        var activeSubs = await db.CustomerSubscriptions.CountAsync(s => s.Status == SubscriptionStatus.Active && !s.IsDeleted, ct);
        var providers = await db.Providers.CountAsync(p => !p.IsDeleted, ct);
        var openVisits = await db.JobVisits.CountAsync(v => v.Status == VisitStatus.OpenForClaim && !v.IsDeleted, ct);
        var escalations = await db.Escalations.CountAsync(e => e.Status == EscalationStatus.Open && !e.IsDeleted, ct);
        return Ok(new AdminDashboardResponse(customers, activeSubs, providers, openVisits, escalations));
    }

    [HttpGet("customers")]
    public async Task<ActionResult> Customers(CancellationToken ct)
    {
        var list = await db.Customers.AsNoTracking()
            .Where(c => !c.IsDeleted)
            .Select(c => new
            {
                c.Id,
                c.User.Email,
                Name = c.User.FirstName + " " + c.User.LastName,
                c.CreatedAtUtc
            })
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpGet("providers")]
    public async Task<ActionResult> Providers(CancellationToken ct)
    {
        var list = await db.Providers.AsNoTracking()
            .Where(p => !p.IsDeleted)
            .Select(p => new
            {
                p.Id,
                p.User.Email,
                name = p.User.FirstName + " " + p.User.LastName,
                p.IsApproved,
                sectors = p.Territories.Select(t => t.PostcodeSector).ToList()
            })
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("providers/{id:guid}/approve")]
    public async Task<IActionResult> ApproveProvider(Guid id, CancellationToken ct)
    {
        var provider = await db.Providers.FirstOrDefaultAsync(p => p.Id == id, ct);
        if (provider is null) return NotFound();
        provider.IsApproved = true;
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpGet("visits")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> Visits(CancellationToken ct)
    {
        var visits = await db.JobVisits.AsNoTracking()
            .Where(v => !v.IsDeleted)
            .OrderByDescending(v => v.ScheduledDate)
            .Take(100)
            .Select(v => new JobVisitResponse(
                v.Id,
                v.ScheduledDate,
                v.AvailabilityWindow,
                v.Status,
                v.Property.Postcode,
                v.AssignedProvider != null ? v.AssignedProvider.User.FirstName + " " + v.AssignedProvider.User.LastName : null))
            .ToListAsync(ct);
        return Ok(visits);
    }

    [HttpPost("visits/{visitId:guid}/cancel")]
    public async Task<ActionResult<JobVisitResponse>> CancelVisit(Guid visitId, CancellationToken ct)
    {
        try
        {
            var result = await visits.CancelVisitAsync(visitId, owningCustomerId: null, allowInProgress: true, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("visits/{visitId:guid}/reschedule")]
    public async Task<ActionResult<JobVisitResponse>> RescheduleVisit(
        Guid visitId,
        [FromBody] RescheduleVisitRequest request,
        CancellationToken ct)
    {
        try
        {
            var result = await visits.RescheduleVisitAsync(
                visitId,
                request.ScheduledDate,
                owningCustomerId: null,
                allowInProgress: true,
                ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("escalations")]
    public async Task<ActionResult<IEnumerable<EscalationResponse>>> Escalations(CancellationToken ct)
    {
        var list = await db.Escalations.AsNoTracking()
            .Where(e => !e.IsDeleted)
            .OrderByDescending(e => e.CreatedAtUtc)
            .Select(e => new EscalationResponse(
                e.Id,
                e.Reason,
                e.Status,
                e.CreatedAtUtc,
                e.Customer != null ? e.Customer.User.Email : null,
                e.Notes))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("escalations/{id:guid}/start")]
    public async Task<ActionResult<EscalationResponse>> StartEscalation(Guid id, CancellationToken ct)
    {
        var escalation = await db.Escalations
            .Include(e => e.Customer).ThenInclude(c => c!.User)
            .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, ct);
        if (escalation is null) return NotFound();

        if (escalation.Status != EscalationStatus.Open)
            return BadRequest(new { error = "Only open escalations can be assigned." });

        escalation.Status = EscalationStatus.InProgress;
        escalation.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("support", "escalation_started", nameof(Escalation), escalation.Id, null, ct);

        return Ok(ToEscalationResponse(escalation));
    }

    [HttpPost("escalations/{id:guid}/resolve")]
    public async Task<ActionResult<EscalationResponse>> ResolveEscalation(
        Guid id,
        [FromBody] ResolveEscalationRequest? request,
        CancellationToken ct)
    {
        var escalation = await db.Escalations
            .Include(e => e.Customer).ThenInclude(c => c!.User)
            .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted, ct);
        if (escalation is null) return NotFound();

        if (escalation.Status == EscalationStatus.Resolved)
            return BadRequest(new { error = "Escalation is already resolved." });

        if (!string.IsNullOrWhiteSpace(request?.Notes))
            escalation.Notes = request.Notes.Trim();

        escalation.Status = EscalationStatus.Resolved;
        escalation.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("support", "escalation_resolved", nameof(Escalation), escalation.Id, null, ct);

        return Ok(ToEscalationResponse(escalation));
    }

    private static EscalationResponse ToEscalationResponse(Escalation e) =>
        new(
            e.Id,
            e.Reason,
            e.Status,
            e.CreatedAtUtc,
            e.Customer?.User.Email,
            e.Notes);

    [HttpPost("scheduling/open-dispatch")]
    public async Task<IActionResult> OpenDispatch(CancellationToken ct)
    {
        await scheduling.OpenVisitsForDispatchAsync(ct);
        return NoContent();
    }
}
