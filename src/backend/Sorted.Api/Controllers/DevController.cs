using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sorted.Core.Dtos;
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
    IEmailService email,
    ISmsService sms,
    IHostEnvironment env,
    IOptions<FeaturesOptions> features,
    IOptions<SendGridOptions> sendGrid,
    IOptions<TwilioOptions> twilio) : ControllerBase
{
    [HttpGet("communications-status")]
    [AllowAnonymous]
    public IActionResult CommunicationsStatus()
    {
        if (!CanUseDevTools())
            return NotFound();

        var sg = sendGrid.Value;
        var tw = twilio.Value;
        return Ok(new
        {
            sendGridConfigured = !string.IsNullOrWhiteSpace(sg.ApiKey),
            sendGridFromEmail = sg.FromEmail,
            sendGridFromName = sg.FromName,
            twilioConfigured = !string.IsNullOrWhiteSpace(tw.AccountSid)
                && !string.IsNullOrWhiteSpace(tw.AuthToken)
                && !string.IsNullOrWhiteSpace(tw.FromPhoneNumber),
            twilioFromPhone = string.IsNullOrWhiteSpace(tw.FromPhoneNumber) ? null : tw.FromPhoneNumber,
        });
    }

    [HttpPost("test-notifications")]
    [AllowAnonymous]
    public async Task<IActionResult> TestNotifications([FromBody] TestNotificationsRequest request, CancellationToken ct)
    {
        if (!CanUseDevTools())
            return NotFound();

        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { error = "Email is required." });

        var visitDate = DateTime.UtcNow.Date.AddDays(2);
        const string postcode = "LS1 4AP";
        const string window = "Morning (8am–12pm)";

        await email.SendWelcomeEmailAsync(request.Email, request.FirstName, ct);
        await email.SendSubscriptionConfirmedEmailAsync(request.Email, "Essential Monthly", ct);
        await email.SendVisitClaimedEmailAsync(request.Email, visitDate, postcode, window, ct);
        await email.SendVisitReminderEmailAsync(request.Email, visitDate, postcode, window, ct);

        var smsSent = false;
        if (!string.IsNullOrWhiteSpace(request.Phone))
        {
            await sms.SendWelcomeSmsAsync(request.Phone, request.FirstName, ct);
            await sms.SendSubscriptionConfirmedSmsAsync(request.Phone, "Essential Monthly", ct);
            await sms.SendVisitClaimedSmsAsync(request.Phone, visitDate, postcode, ct);
            await sms.SendVisitReminderSmsAsync(request.Phone, visitDate, postcode, ct);
            smsSent = true;
        }

        return Ok(new
        {
            message = "Test notifications dispatched. Check your inbox"
                + (smsSent ? " and phone." : " (no phone provided for SMS)."),
            email = request.Email,
            phone = request.Phone,
        });
    }

    [HttpPost("activate-subscription/{subscriptionId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> ActivateSubscription(Guid subscriptionId, CancellationToken ct)
    {
        if (!CanUseDevTools())
            return NotFound();

        var sub = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId, ct);
        if (sub is null) return NotFound();

        sub.Status = SubscriptionStatus.Active;
        sub.StartedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
        await scheduling.GenerateVisitsForSubscriptionAsync(subscriptionId, ct: ct);
        await scheduling.OpenVisitsForDispatchAsync(ct);

        await email.SendSubscriptionConfirmedEmailAsync(sub.Customer.User.Email, sub.Plan.Name, ct);
        if (!string.IsNullOrWhiteSpace(sub.Customer.User.Phone))
            await sms.SendSubscriptionConfirmedSmsAsync(sub.Customer.User.Phone, sub.Plan.Name, ct);

        return Ok(new { message = "Subscription activated (dev bypass)." });
    }

    [HttpPost("run-background-jobs")]
    [AllowAnonymous]
    public async Task<IActionResult> RunBackgroundJobs(CancellationToken ct)
    {
        if (!env.IsDevelopment())
            return NotFound();

        await scheduling.TopUpFutureVisitsAsync(ct: ct);
        await scheduling.OpenUpcomingVisitsForDispatchAsync(ct: ct);
        await scheduling.ExpireStaleDispatchOffersAsync(ct: ct);
        await scheduling.SendDueVisitRemindersAsync(ct: ct);
        return Ok(new { message = "Background jobs completed." });
    }

    private bool CanUseDevTools() =>
        env.IsDevelopment() || features.Value.BypassStripeCheckout;
}
