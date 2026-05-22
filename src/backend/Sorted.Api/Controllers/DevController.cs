using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

/// <summary>Dev/staging helpers when Stripe checkout is bypassed.</summary>
[ApiController]
[Route("api/dev")]
public class DevController(
    SortedDbContext db,
    IVisitSchedulingService scheduling,
    IHostEnvironment env,
    IOptions<FeaturesOptions> features) : ControllerBase
{
    [HttpPost("activate-subscription/{subscriptionId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> ActivateSubscription(Guid subscriptionId, CancellationToken ct)
    {
        if (!CanBypassPayment())
            return NotFound();

        var sub = await db.CustomerSubscriptions.FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);
        if (sub is null) return NotFound();

        sub.Status = SubscriptionStatus.Active;
        sub.StartedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await scheduling.GenerateVisitsForSubscriptionAsync(subscriptionId, ct: ct);
        await scheduling.OpenVisitsForDispatchAsync(ct);
        return Ok(new { message = "Subscription activated (dev bypass)." });
    }

    private bool CanBypassPayment() =>
        env.IsDevelopment() || features.Value.BypassStripeCheckout;
}
