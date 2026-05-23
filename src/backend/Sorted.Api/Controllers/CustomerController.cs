using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/customer")]
[Authorize(Roles = nameof(UserRole.Customer))]
public class CustomerController(
    SortedDbContext db,
    IStripePaymentService stripe,
    IAiSupportService ai,
    IVisitManagementService visits,
    IPostcodeGeocodingService geocoding,
    IWorkflowLogger workflow) : ControllerBase
{
    private async Task<Guid> GetCustomerIdAsync(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await db.Customers.Where(c => c.UserId == userId).Select(c => c.Id).FirstAsync(ct);
    }

    [HttpGet("subscriptions")]
    public async Task<ActionResult<IEnumerable<CustomerSubscriptionResponse>>> Subscriptions(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var subs = await db.CustomerSubscriptions.AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.CustomerId == customerId && !s.IsDeleted)
            .ToListAsync(ct);

        var responses = subs.Select(s => new CustomerSubscriptionResponse(
            s.Id,
            s.Plan.Name,
            s.Status,
            s.StartedAtUtc,
            s.AvailabilityPreference,
            s.EndsAtUtc,
            s.CancelsAtUtc,
            CanManageBilling(s))).ToList();

        return Ok(responses);
    }

    private static bool CanManageBilling(CustomerSubscription s) =>
        s.Status != SubscriptionStatus.PendingPayment
        && (!string.IsNullOrWhiteSpace(s.StripeCustomerId)
            || !string.IsNullOrWhiteSpace(s.StripeSubscriptionId));

    [HttpPost("subscriptions/{subscriptionId:guid}/billing-portal")]
    public async Task<ActionResult<BillingPortalSessionResponse>> BillingPortal(Guid subscriptionId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.Customer.UserId == userId && !s.IsDeleted, ct);
        if (sub is null) return NotFound();

        try
        {
            return Ok(await stripe.CreateBillingPortalSessionAsync(sub, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("subscriptions/{subscriptionId:guid}/checkout")]
    public async Task<ActionResult<CheckoutSessionResponse>> Checkout(Guid subscriptionId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.Customer.UserId == userId, ct);
        if (sub is null) return NotFound();
        if (sub.Status != SubscriptionStatus.PendingPayment)
            return BadRequest(new { error = "Subscription is not awaiting payment." });

        try
        {
            var session = await stripe.CreateSignupCheckoutAsync(sub, sub.Plan, sub.Customer.User.Email, ct);
            return Ok(session);
        }
        catch (Exception ex)
        {
            var detail = ex.GetBaseException().Message;
            return BadRequest(new { error = detail });
        }
    }

    [HttpGet("visits")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> Visits(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var visits = await db.JobVisits.AsNoTracking()
            .Where(v => v.Subscription.CustomerId == customerId && !v.IsDeleted)
            .OrderBy(v => v.ScheduledDate)
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
            var customerId = await GetCustomerIdAsync(ct);
            var result = await visits.CancelVisitAsync(visitId, customerId, allowInProgress: false, ct);
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
            var customerId = await GetCustomerIdAsync(ct);
            var result = await visits.RescheduleVisitAsync(
                visitId,
                request.ScheduledDate,
                customerId,
                allowInProgress: false,
                ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("support/chat")]
    public async Task<ActionResult<SupportChatResponse>> SupportChat([FromBody] SupportChatRequest request, CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        return Ok(await ai.ChatAsync(customerId, request, ct));
    }

    [HttpGet("properties")]
    public async Task<ActionResult<IEnumerable<CustomerPropertyResponse>>> Properties(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var list = await db.CustomerProperties.AsNoTracking()
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
        return Ok(list);
    }

    [HttpPut("properties/{propertyId:guid}")]
    public async Task<ActionResult<CustomerPropertyResponse>> UpdateProperty(
        Guid propertyId,
        [FromBody] UpdateCustomerPropertyRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Line1)
            || string.IsNullOrWhiteSpace(request.City)
            || string.IsNullOrWhiteSpace(request.Postcode))
            return BadRequest(new { error = "Address line 1, city, and postcode are required." });

        var customerId = await GetCustomerIdAsync(ct);
        var property = await db.CustomerProperties
            .FirstOrDefaultAsync(p => p.Id == propertyId && p.CustomerId == customerId && !p.IsDeleted, ct);
        if (property is null) return NotFound();

        var normalizedPostcode = PostcodeFormat.Normalize(request.Postcode);
        var postcodeChanged = !string.Equals(property.Postcode, normalizedPostcode, StringComparison.OrdinalIgnoreCase);

        property.Line1 = request.Line1.Trim();
        property.Line2 = string.IsNullOrWhiteSpace(request.Line2) ? null : request.Line2.Trim();
        property.City = request.City.Trim();
        property.Postcode = normalizedPostcode;
        property.GardenSize = request.GardenSize;
        property.AccessNotes = string.IsNullOrWhiteSpace(request.AccessNotes) ? null : request.AccessNotes.Trim();
        property.UpdatedAtUtc = DateTime.UtcNow;

        if (postcodeChanged)
        {
            var geo = await geocoding.LookupAsync(property.Postcode, ct);
            property.Latitude = geo?.Latitude;
            property.Longitude = geo?.Longitude;
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "customer_property",
            "updated",
            nameof(CustomerProperty),
            property.Id,
            new { property.Postcode, property.GardenSize },
            ct);

        return Ok(new CustomerPropertyResponse(
            property.Id,
            property.Line1,
            property.Line2,
            property.City,
            property.Postcode,
            property.GardenSize,
            property.AccessNotes,
            property.IsPrimary));
    }
}
