using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = nameof(UserRole.Admin))]
public class AdminController(SortedDbContext db, IVisitSchedulingService scheduling) : ControllerBase
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

    [HttpGet("escalations")]
    public async Task<ActionResult<IEnumerable<EscalationResponse>>> Escalations(CancellationToken ct)
    {
        var list = await db.Escalations.AsNoTracking()
            .Where(e => !e.IsDeleted)
            .OrderByDescending(e => e.CreatedAtUtc)
            .Select(e => new EscalationResponse(e.Id, e.Reason, e.Status, e.CreatedAtUtc))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPost("scheduling/open-dispatch")]
    public async Task<IActionResult> OpenDispatch(CancellationToken ct)
    {
        await scheduling.OpenVisitsForDispatchAsync(ct);
        return NoContent();
    }
}
