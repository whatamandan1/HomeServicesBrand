# Payments strategy

**Last updated:** 2026-05-24

---

## Current state: Stripe

All consumer subscriptions use **Stripe Checkout** (subscription mode) and the **Customer Billing Portal** for payment method updates.

| Capability | Status |
|------------|--------|
| Recurring card payments | ✅ Stripe |
| Checkout at signup | ✅ |
| Webhooks (activate, renew, fail, cancel) | ✅ |
| Plan upgrades (Essential → Premium → Elite) | ✅ |
| Annual ↔ monthly switch | ✅ |
| Fixed Price IDs (small garden) | ✅ Config-driven - see [`stripe-price-ids-checklist.md`](stripe-price-ids-checklist.md) |
| Dynamic pricing (medium/large garden uplift) | ✅ Stripe `price_data` at checkout |

Implementation: `StripePaymentService`, `IPlatformServices` payment methods, webhook at `/api/webhooks/stripe`.

---

## Considering GoCardless (Direct Debit)

**Why it might help**

- Lower fees on recurring UK payments vs card (~1% + cap vs ~1.5% + 20p card)
- Strong fit for subscriptions homeowners keep for months/years
- Reduced card expiry churn

**Trade-offs**

- Slower first payment (BACS mandate setup, not instant like cards)
- Different UX at signup (mandate authorisation, not card form)
- Refunds and chargebacks work differently
- No built-in “Billing Portal” equivalent - more custom UI

**Recommendation**

1. **Go-live on Stripe first** with all six Price IDs configured ([checklist](stripe-price-ids-checklist.md)).
2. **Evaluate GoCardless** once you have 20–50 paying customers and clear unit economics.
3. **Do not bolt GoCardless into `StripePaymentService`** - introduce a small `IPaymentProvider` (or `ISubscriptionBillingService`) abstraction when you start integration:
   - `CreateCheckoutAsync`
   - `HandleWebhookAsync`
   - `UpgradePlanAsync`
   - `GetBillingPortalUrlAsync` (Stripe) / mandate management (GoCardless)
4. Offer **card or Direct Debit** at signup only after both paths are tested in staging.

No GoCardless code exists in the repo yet; this doc captures intent only.

---

## Pre-production gate

Before accepting real money:

1. Complete [`stripe-price-ids-checklist.md`](stripe-price-ids-checklist.md)
2. Live Stripe keys + live webhook endpoint
3. `Features__BypassStripeCheckout=false`
4. `Features__SeedDemoData=false` (go-live)
5. Test all three tiers + medium garden uplift + upgrade path

---

## Related docs

- [`stripe-local-setup.md`](stripe-local-setup.md) - local dev with Stripe CLI
- [`deploy-staging.md`](deploy-staging.md) - Railway + Vercel
- [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md) - plan amounts
