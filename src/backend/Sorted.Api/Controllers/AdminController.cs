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
    IStripePaymentService stripe,
    IVisitSchedulingService scheduling,
    IVisitManagementService visits,
    IWorkflowLogger workflow,
    IPostcodeGeocodingService geocoding) : ControllerBase
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

    [HttpGet("customers/{customerId:guid}")]
    public async Task<ActionResult<AdminCustomerDetailResponse>> CustomerDetail(Guid customerId, CancellationToken ct)
    {
        var customer = await db.Customers.AsNoTracking()
            .Include(c => c.User)
            .FirstOrDefaultAsync(c => c.Id == customerId && !c.IsDeleted, ct);
        if (customer is null) return NotFound();

        var subscriptions = await db.CustomerSubscriptions.AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.CustomerId == customerId && !s.IsDeleted)
            .OrderByDescending(s => s.CreatedAtUtc)
            .ToListAsync(ct);

        var properties = await db.CustomerProperties.AsNoTracking()
            .Where(p => p.CustomerId == customerId && !p.IsDeleted)
            .OrderByDescending(p => p.IsPrimary)
            .ThenBy(p => p.CreatedAtUtc)
            .Select(p => new CustomerPropertyResponse(
                p.Id,
                p.Line1,
                p.Line2,
                p.City,
                p.Postcode,
                p.GardenSize,
                p.AccessNotes,
                p.IsPrimary))
            .ToListAsync(ct);

        var recentVisits = await db.JobVisits.AsNoTracking()
            .Where(v => v.Subscription.CustomerId == customerId && !v.IsDeleted)
            .OrderByDescending(v => v.ScheduledDate)
            .Take(10)
            .Select(v => new JobVisitResponse(
                v.Id,
                v.ScheduledDate,
                v.AvailabilityWindow,
                v.Status,
                v.Property.Postcode,
                v.AssignedProvider != null
                    ? v.AssignedProvider.User.FirstName + " " + v.AssignedProvider.User.LastName
                    : null,
                v.Property.Latitude,
                v.Property.Longitude))
            .ToListAsync(ct);

        return Ok(new AdminCustomerDetailResponse(
            customer.Id,
            customer.User.Email,
            customer.User.FirstName + " " + customer.User.LastName,
            customer.User.Phone,
            customer.CreatedAtUtc,
            subscriptions.Select(ToAdminSubscription).ToList(),
            properties,
            recentVisits));
    }

    private static AdminCustomerSubscriptionResponse ToAdminSubscription(CustomerSubscription s)
    {
        var hasStripe = !string.IsNullOrWhiteSpace(s.StripeSubscriptionId);
        var canCancel = s.Status is SubscriptionStatus.Active or SubscriptionStatus.PastDue
            && s.CancelsAtUtc is null;

        return new AdminCustomerSubscriptionResponse(
            s.Id,
            s.Plan.Name,
            s.Status,
            s.StartedAtUtc,
            s.EndsAtUtc,
            s.CancelsAtUtc,
            hasStripe,
            canCancel);
    }

    [HttpGet("providers")]
    public async Task<ActionResult> Providers(CancellationToken ct)
    {
        var providers = await db.Providers
            .Include(p => p.User)
            .Include(p => p.Territories)
            .Where(p => !p.IsDeleted)
            .ToListAsync(ct);

        var backfilled = false;
        foreach (var provider in providers)
        {
            if (provider.CoverageLatitude is not null && provider.CoverageLongitude is not null)
                continue;
            if (string.IsNullOrWhiteSpace(provider.CoveragePostcode))
                continue;

            var geo = await geocoding.LookupAsync(provider.CoveragePostcode, ct);
            if (geo is null) continue;

            provider.CoveragePostcode = geo.Postcode;
            provider.CoverageLatitude = geo.Latitude;
            provider.CoverageLongitude = geo.Longitude;
            provider.UpdatedAtUtc = DateTime.UtcNow;
            backfilled = true;
        }

        if (backfilled)
            await db.SaveChangesAsync(ct);

        var list = providers
            .OrderBy(p => p.User.LastName)
            .ThenBy(p => p.User.FirstName)
            .Select(p => new
            {
                p.Id,
                p.User.Email,
                name = p.User.FirstName + " " + p.User.LastName,
                p.IsApproved,
                coveragePostcode = p.CoveragePostcode,
                coverageRadiusMiles = p.CoverageRadiusMiles,
                coverageLatitude = p.CoverageLatitude,
                coverageLongitude = p.CoverageLongitude,
                coveredOutcodes = p.Territories
                    .Where(t => !t.IsDeleted)
                    .Select(t => t.PostcodeSector)
                    .OrderBy(s => s)
                    .ToList()
            })
            .ToList();

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
                v.AssignedProvider != null ? v.AssignedProvider.User.FirstName + " " + v.AssignedProvider.User.LastName : null,
                v.Property.Latitude,
                v.Property.Longitude))
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

    [HttpPost("subscriptions/{subscriptionId:guid}/cancel")]
    public async Task<ActionResult<CancelSubscriptionResponse>> CancelSubscription(Guid subscriptionId, CancellationToken ct)
    {
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && !s.IsDeleted, ct);
        if (sub is null) return NotFound();

        try
        {
            return Ok(await stripe.CancelSubscriptionAsync(sub, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("workflow-events")]
    public async Task<ActionResult<IEnumerable<WorkflowEventResponse>>> WorkflowEvents(
        [FromQuery] string? workflow,
        [FromQuery] int limit = 100,
        CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 500);
        var query = db.WorkflowEvents.AsNoTracking().Where(e => !e.IsDeleted);

        if (!string.IsNullOrWhiteSpace(workflow))
            query = query.Where(e => e.WorkflowName == workflow.Trim());

        var list = await query
            .OrderByDescending(e => e.CreatedAtUtc)
            .Take(limit)
            .Select(e => new WorkflowEventResponse(
                e.Id,
                e.WorkflowName,
                e.EventName,
                e.EntityType,
                e.EntityId,
                e.PayloadJson,
                e.CreatedAtUtc))
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpGet("ai-actions")]
    public async Task<ActionResult<IEnumerable<AiActionLogResponse>>> AiActions(
        [FromQuery] string? actionType,
        [FromQuery] bool escalatedOnly = false,
        [FromQuery] int limit = 100,
        CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 500);
        var query = db.AIActionLogs.AsNoTracking().Where(a => !a.IsDeleted);

        if (!string.IsNullOrWhiteSpace(actionType))
            query = query.Where(a => a.ActionType == actionType.Trim());

        if (escalatedOnly)
            query = query.Where(a => a.Escalated);

        var list = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Take(limit)
            .Select(a => new AiActionLogResponse(
                a.Id,
                a.CustomerId,
                a.CustomerId != null
                    ? db.Customers.Where(c => c.Id == a.CustomerId).Select(c => c.User.Email).FirstOrDefault()
                    : null,
                a.ActionType,
                a.PromptSummary,
                a.ResponseSummary,
                a.ConfidenceScore,
                a.Escalated,
                a.CreatedAtUtc))
            .ToListAsync(ct);

        return Ok(list);
    }

    [HttpGet("communication-threads")]
    public async Task<ActionResult<IEnumerable<CommunicationThreadSummaryResponse>>> CommunicationThreads(
        [FromQuery] int limit = 50,
        CancellationToken ct = default)
    {
        limit = Math.Clamp(limit, 1, 200);
        var threads = await db.CommunicationThreads.AsNoTracking()
            .Where(t => !t.IsDeleted)
            .OrderByDescending(t => t.UpdatedAtUtc ?? t.CreatedAtUtc)
            .Take(limit)
            .Select(t => new
            {
                t.Id,
                t.CustomerId,
                CustomerEmail = t.Customer != null ? t.Customer.User.Email : null,
                t.Subject,
                t.CreatedAtUtc,
                MessageCount = t.Messages.Count(m => !m.IsDeleted),
                LastMessage = t.Messages
                    .Where(m => !m.IsDeleted)
                    .OrderByDescending(m => m.CreatedAtUtc)
                    .Select(m => m.Body)
                    .FirstOrDefault()
            })
            .ToListAsync(ct);

        var list = threads.Select(t => new CommunicationThreadSummaryResponse(
            t.Id,
            t.CustomerId,
            t.CustomerEmail,
            t.Subject,
            t.MessageCount,
            t.LastMessage is null ? null : (t.LastMessage.Length > 120 ? t.LastMessage[..117] + "…" : t.LastMessage),
            t.CreatedAtUtc)).ToList();

        return Ok(list);
    }

    [HttpGet("communication-threads/{id:guid}")]
    public async Task<ActionResult<CommunicationThreadDetailResponse>> CommunicationThread(Guid id, CancellationToken ct)
    {
        var thread = await db.CommunicationThreads.AsNoTracking()
            .Where(t => t.Id == id && !t.IsDeleted)
            .Select(t => new CommunicationThreadDetailResponse(
                t.Id,
                t.CustomerId,
                t.Customer != null ? t.Customer.User.Email : null,
                t.Subject,
                t.Messages
                    .Where(m => !m.IsDeleted)
                    .OrderBy(m => m.CreatedAtUtc)
                    .Select(m => new AdminMessageResponse(
                        m.Id,
                        m.SenderRole,
                        m.Body,
                        m.IsFromAi,
                        m.CreatedAtUtc))
                    .ToList()))
            .FirstOrDefaultAsync(ct);

        if (thread is null) return NotFound();
        return Ok(thread);
    }
}
