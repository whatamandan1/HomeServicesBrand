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
    IOptions<PlanPricingOptions> planPricingOptions,
    IEmailService email,
    ISmsService sms,
    IVisitSchedulingService scheduling,
    IWorkflowLogger workflow,
    ILogger<StripePaymentService> logger) : IStripePaymentService
{
    private readonly StripeOptions _options = stripeOptions.Value;
    private readonly PlanPricingOptions _planPricing = planPricingOptions.Value;

    public async Task<CheckoutSessionResponse> CreateSignupCheckoutAsync(
        CustomerSubscription subscription,
        SubscriptionPlan plan,
        string customerEmail,
        CancellationToken ct = default)
    {
        EnsureApiKey();

        var chargePrice = PlanPricing.ResolvePrice(plan, _planPricing);
        var lineItem = BuildSubscriptionLineItem(plan, chargePrice);
        var sessionService = new SessionService();
        var session = await sessionService.CreateAsync(new SessionCreateOptions
        {
            Mode = "subscription",
            CustomerEmail = customerEmail,
            SuccessUrl = _options.SuccessUrl + "?session_id={CHECKOUT_SESSION_ID}",
            CancelUrl = _options.CancelUrl,
            Metadata = new Dictionary<string, string>
            {
                ["subscriptionId"] = subscription.Id.ToString(),
                ["planId"] = plan.Id.ToString()
            },
            SubscriptionData = new SessionSubscriptionDataOptions
            {
                Metadata = new Dictionary<string, string>
                {
                    ["subscriptionId"] = subscription.Id.ToString(),
                    ["planId"] = plan.Id.ToString(),
                    ["minimumTermMonths"] = plan.MinimumTermMonths.ToString()
                }
            },
            LineItems = [lineItem]
        }, cancellationToken: ct);

        db.Payments.Add(new PaymentRecord
        {
            CustomerSubscriptionId = subscription.Id,
            AmountGbp = chargePrice,
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

        EnsureApiKey();
        var stripeEvent = EventUtility.ConstructEvent(
            json,
            stripeSignature,
            _options.WebhookSecret,
            throwOnApiVersionMismatch: false);

        switch (stripeEvent.Type)
        {
            case "checkout.session.completed":
                await HandleCheckoutCompletedAsync(stripeEvent, ct);
                break;
            case "invoice.paid":
                await HandleInvoicePaidAsync(stripeEvent, ct);
                break;
            case "invoice.payment_failed":
                await HandleInvoicePaymentFailedAsync(stripeEvent, ct);
                break;
            case "customer.subscription.updated":
                await HandleSubscriptionUpdatedAsync(stripeEvent, ct);
                break;
            case "customer.subscription.deleted":
                await HandleSubscriptionDeletedAsync(stripeEvent, ct);
                break;
            default:
                logger.LogDebug("Unhandled Stripe event type {EventType}", stripeEvent.Type);
                break;
        }
    }

    private SessionLineItemOptions BuildSubscriptionLineItem(SubscriptionPlan plan, decimal chargePrice)
    {
        if (!string.IsNullOrWhiteSpace(plan.StripePriceId))
        {
            if (plan.StripePriceId.StartsWith("prod_", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException(
                    "Stripe is configured with a Product ID (prod_...) instead of a Price ID (price_...). " +
                    "In Stripe Dashboard → Products → open your plan → under Pricing, copy the Price ID. " +
                    "Update Stripe__Prices__EssentialMonthly / EssentialAnnual on Railway, then redeploy.");
            }

            return new SessionLineItemOptions
            {
                Price = plan.StripePriceId,
                Quantity = 1
            };
        }

        var amountPence = (long)(chargePrice * 100);
        return new SessionLineItemOptions
        {
            Quantity = 1,
            PriceData = new SessionLineItemPriceDataOptions
            {
                Currency = "gbp",
                UnitAmount = amountPence,
                Recurring = new SessionLineItemPriceDataRecurringOptions
                {
                    Interval = plan.BillingInterval == SubscriptionBillingInterval.Monthly ? "month" : "year"
                },
                ProductData = new SessionLineItemPriceDataProductDataOptions
                {
                    Name = plan.Name,
                    Description = plan.Description
                }
            }
        };
    }

    private async Task HandleCheckoutCompletedAsync(Event stripeEvent, CancellationToken ct)
    {
        var session = stripeEvent.Data.Object as Session
            ?? throw new InvalidOperationException("Invalid checkout session payload.");

        if (session.Mode != "subscription")
        {
            logger.LogWarning("Ignoring checkout.session.completed for non-subscription mode");
            return;
        }

        if (!session.Metadata.TryGetValue("subscriptionId", out var subIdStr) || !Guid.TryParse(subIdStr, out var subId))
            return;

        var subscription = await LoadSubscriptionAsync(subId, ct);
        if (subscription is null)
            return;

        subscription.StripeCustomerId = session.CustomerId;
        subscription.StripeSubscriptionId = session.SubscriptionId;

        var payment = await db.Payments.FirstOrDefaultAsync(p => p.StripeCheckoutSessionId == session.Id, ct);
        if (payment is not null)
            payment.StripePaymentIntentId = session.PaymentIntentId;

        await db.SaveChangesAsync(ct);

        if (subscription.Status == SubscriptionStatus.PendingPayment)
            await ActivateSubscriptionAsync(subscription, ct);
    }

    private async Task HandleInvoicePaidAsync(Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Invoice
            ?? throw new InvalidOperationException("Invalid invoice payload.");

        if (string.IsNullOrWhiteSpace(invoice.SubscriptionId))
            return;

        var subscription = await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == invoice.SubscriptionId, ct);

        if (subscription is null)
        {
            logger.LogWarning("Invoice paid for unknown Stripe subscription {StripeSubscriptionId}", invoice.SubscriptionId);
            return;
        }

        if (await db.Payments.AnyAsync(p => p.StripeInvoiceId == invoice.Id, ct))
            return;

        var amountGbp = invoice.AmountPaid / 100m;
        db.Payments.Add(new PaymentRecord
        {
            CustomerSubscriptionId = subscription.Id,
            AmountGbp = amountGbp,
            Status = PaymentStatus.Succeeded,
            StripeInvoiceId = invoice.Id,
            StripePaymentIntentId = invoice.PaymentIntentId
        });

        if (subscription.Status is SubscriptionStatus.PastDue or SubscriptionStatus.PendingPayment)
            subscription.Status = SubscriptionStatus.Active;

        await db.SaveChangesAsync(ct);

        var isRenewal = invoice.BillingReason == "subscription_cycle";
        await workflow.LogAsync(
            "billing",
            isRenewal ? "subscription_renewed" : "invoice_paid",
            nameof(CustomerSubscription),
            subscription.Id,
            $"{{\"invoiceId\":\"{invoice.Id}\",\"amountGbp\":{amountGbp}}}",
            ct);

        if (isRenewal)
            logger.LogInformation("Recorded renewal payment for subscription {SubscriptionId}", subscription.Id);
    }

    private async Task HandleInvoicePaymentFailedAsync(Event stripeEvent, CancellationToken ct)
    {
        var invoice = stripeEvent.Data.Object as Invoice
            ?? throw new InvalidOperationException("Invalid invoice payload.");

        if (string.IsNullOrWhiteSpace(invoice.SubscriptionId))
            return;

        var subscription = await db.CustomerSubscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == invoice.SubscriptionId, ct);

        if (subscription is null)
            return;

        subscription.Status = SubscriptionStatus.PastDue;
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "billing",
            "payment_failed",
            nameof(CustomerSubscription),
            subscription.Id,
            $"{{\"invoiceId\":\"{invoice.Id}\"}}",
            ct);

        logger.LogWarning("Subscription {SubscriptionId} marked PastDue after failed invoice {InvoiceId}",
            subscription.Id, invoice.Id);
    }

    private async Task HandleSubscriptionUpdatedAsync(Event stripeEvent, CancellationToken ct)
    {
        var stripeSubscription = stripeEvent.Data.Object as Subscription
            ?? throw new InvalidOperationException("Invalid subscription payload.");

        var subscription = await db.CustomerSubscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscription.Id, ct);

        if (subscription is null)
            return;

        var mapped = MapStripeStatus(stripeSubscription.Status);
        if (subscription.Status != mapped)
        {
            subscription.Status = mapped;
            await db.SaveChangesAsync(ct);
            await workflow.LogAsync(
                "billing",
                "subscription_status_changed",
                nameof(CustomerSubscription),
                subscription.Id,
                $"{{\"stripeStatus\":\"{stripeSubscription.Status}\"}}",
                ct);
        }
    }

    private async Task HandleSubscriptionDeletedAsync(Event stripeEvent, CancellationToken ct)
    {
        var stripeSubscription = stripeEvent.Data.Object as Subscription
            ?? throw new InvalidOperationException("Invalid subscription payload.");

        var subscription = await db.CustomerSubscriptions
            .FirstOrDefaultAsync(s => s.StripeSubscriptionId == stripeSubscription.Id, ct);

        if (subscription is null)
            return;

        subscription.Status = SubscriptionStatus.Cancelled;
        subscription.EndsAtUtc ??= DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "billing",
            "subscription_cancelled",
            nameof(CustomerSubscription),
            subscription.Id,
            null,
            ct);
    }

    private async Task ActivateSubscriptionAsync(CustomerSubscription subscription, CancellationToken ct)
    {
        subscription.Status = SubscriptionStatus.Active;
        subscription.StartedAtUtc = DateTime.UtcNow;
        subscription.EndsAtUtc = DateTime.UtcNow.AddMonths(subscription.Plan.MinimumTermMonths);

        var payment = await db.Payments
            .Where(p => p.CustomerSubscriptionId == subscription.Id && p.Status == PaymentStatus.Pending)
            .OrderByDescending(p => p.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (payment is not null)
            payment.Status = PaymentStatus.Succeeded;

        await db.SaveChangesAsync(ct);

        await workflow.LogAsync("billing", "payment_succeeded", nameof(CustomerSubscription), subscription.Id, null, ct);
        await scheduling.GenerateVisitsForSubscriptionAsync(subscription.Id, ct: ct);
        await scheduling.OpenVisitsForDispatchAsync(ct);
        await email.SendSubscriptionConfirmedEmailAsync(subscription.Customer.User.Email, subscription.Plan.Name, ct);

        if (!string.IsNullOrWhiteSpace(subscription.Customer.User.Phone))
            await sms.SendSubscriptionConfirmedSmsAsync(subscription.Customer.User.Phone, subscription.Plan.Name, ct);
    }

    private async Task<CustomerSubscription?> LoadSubscriptionAsync(Guid subId, CancellationToken ct)
        => await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Plan)
            .FirstOrDefaultAsync(s => s.Id == subId, ct);

    private static SubscriptionStatus MapStripeStatus(string status) => status switch
    {
        "active" or "trialing" => SubscriptionStatus.Active,
        "past_due" => SubscriptionStatus.PastDue,
        "canceled" => SubscriptionStatus.Cancelled,
        "unpaid" => SubscriptionStatus.PastDue,
        "incomplete" => SubscriptionStatus.PendingPayment,
        "incomplete_expired" => SubscriptionStatus.Expired,
        _ => SubscriptionStatus.Active
    };

    private void EnsureApiKey()
    {
        if (string.IsNullOrWhiteSpace(_options.SecretKey))
            throw new InvalidOperationException("Stripe SecretKey is not configured.");
        StripeConfiguration.ApiKey = _options.SecretKey;
    }
}
