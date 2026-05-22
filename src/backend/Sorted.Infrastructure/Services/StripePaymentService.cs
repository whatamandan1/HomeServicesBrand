using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;
using Stripe;
using Stripe.Checkout;

namespace Sorted.Infrastructure.Services;

public class StripePaymentService(
    SortedDbContext db,
    IOptions<StripeOptions> stripeOptions,
    IEmailService email,
    ISmsService sms,
    IVisitSchedulingService scheduling,
    IWorkflowLogger workflow,
    ILogger<StripePaymentService> logger) : IStripePaymentService
{
    private readonly StripeOptions _options = stripeOptions.Value;

    public async Task<CheckoutSessionResponse> CreateSignupCheckoutAsync(
        CustomerSubscription subscription,
        SubscriptionPlan plan,
        string customerEmail,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.SecretKey))
            throw new InvalidOperationException("Stripe SecretKey is not configured.");

        StripeConfiguration.ApiKey = _options.SecretKey;

        var amountPence = (long)(plan.PriceGbp * 100);
        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(new SessionCreateOptions
        {
            Mode = "payment",
            CustomerEmail = customerEmail,
            SuccessUrl = _options.SuccessUrl + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = _options.CancelUrl,
            Metadata = new Dictionary<string, string>
            {
                ["subscriptionId"] = subscription.Id.ToString(),
                ["planId"] = plan.Id.ToString()
            },
            LineItems =
            [
                new SessionLineItemOptions
                {
                    Quantity = 1,
                    PriceData = new SessionLineItemPriceDataOptions
                    {
                        Currency = "gbp",
                        UnitAmount = amountPence,
                        ProductData = new SessionLineItemPriceDataProductDataOptions
                        {
                            Name = plan.Name,
                            Description = plan.Description
                        }
                    }
                }
            ]
        }, cancellationToken: ct);

        db.Payments.Add(new PaymentRecord
        {
            CustomerSubscriptionId = subscription.Id,
            AmountGbp = plan.PriceGbp,
            Status = PaymentStatus.Pending,
            StripeCheckoutSessionId = session.Id
        });
        await db.SaveChangesAsync(ct);

        return new CheckoutSessionResponse(session.Id, session.Url);
    }

    public async Task HandleWebhookAsync(string json, string stripeSignature, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.WebhookSecret))
        {
            logger.LogWarning("Stripe webhook secret not set; skipping verification (dev only).");
            return;
        }

        StripeConfiguration.ApiKey = _options.SecretKey;
        var stripeEvent = EventUtility.ConstructEvent(
            json,
            stripeSignature,
            _options.WebhookSecret,
            throwOnApiVersionMismatch: false);

        if (stripeEvent.Type != "checkout.session.completed")
            return;

        var session = stripeEvent.Data.Object as Session
            ?? throw new InvalidOperationException("Invalid checkout session payload.");

        if (!session.Metadata.TryGetValue("subscriptionId", out var subIdStr) || !Guid.TryParse(subIdStr, out var subId))
            return;

        var subscription = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subId, ct);

        if (subscription is null)
            return;

        subscription.Status = SubscriptionStatus.Active;
        subscription.StartedAtUtc = DateTime.UtcNow;
        subscription.StripeCustomerId = session.CustomerId;

        var payment = await db.Payments.FirstOrDefaultAsync(p => p.StripeCheckoutSessionId == session.Id, ct);
        if (payment is not null)
        {
            payment.Status = PaymentStatus.Succeeded;
            payment.StripePaymentIntentId = session.PaymentIntentId;
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync("billing", "payment_succeeded", nameof(CustomerSubscription), subscription.Id, null, ct);
        await scheduling.GenerateVisitsForSubscriptionAsync(subscription.Id, ct: ct);
        await scheduling.OpenVisitsForDispatchAsync(ct);
        await email.SendSubscriptionConfirmedEmailAsync(subscription.Customer.User.Email, subscription.Plan.Name, ct);
        if (!string.IsNullOrWhiteSpace(subscription.Customer.User.Phone))
            await sms.SendSubscriptionConfirmedSmsAsync(subscription.Customer.User.Phone, subscription.Plan.Name, ct);
    }
}
