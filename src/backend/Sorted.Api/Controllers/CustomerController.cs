using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/customer")]
[Authorize(Roles = nameof(UserRole.Customer))]
public class CustomerController(
    SortedDbContext db,
    IStripePaymentService stripe,
    IAiSupportService ai) : ControllerBase
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
            .Where(s => s.CustomerId == customerId && !s.IsDeleted)
            .Select(s => new CustomerSubscriptionResponse(s.Id, s.Plan.Name, s.Status, s.StartedAtUtc, s.AvailabilityPreference))
            .ToListAsync(ct);
        return Ok(subs);
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
            return BadRequest(new { error = ex.Message });
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
                v.AssignedProvider != null ? v.AssignedProvider.User.FirstName + " " + v.AssignedProvider.User.LastName : null))
            .ToListAsync(ct);
        return Ok(visits);
    }

    [HttpPost("support/chat")]
    public async Task<ActionResult<SupportChatResponse>> SupportChat([FromBody] SupportChatRequest request, CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        return Ok(await ai.ChatAsync(customerId, request, ct));
    }
}
