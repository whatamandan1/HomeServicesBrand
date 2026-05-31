# Stripe Price IDs - pre-deploy checklist

Complete **before** taking real payments in staging or production. Without matching Price IDs, small-garden checkout may use dynamic `price_data` (works in test, harder to reconcile in Stripe Dashboard).

**Plan reference:** [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md)

---

## 1. Create products in Stripe Dashboard

Stripe → **Products** → create one product per plan (or one product with six prices - either is fine).

Use **test mode** first, then repeat in **live mode** before go-live.

| Plan name (DB) | Amount | Interval | Railway env var |
|----------------|--------|----------|-----------------|
| Essential Monthly | £29.95 | Monthly | `Stripe__Prices__EssentialMonthly` |
| Essential Annual | £299.95 | Yearly | `Stripe__Prices__EssentialAnnual` |
| Premium Monthly | £54.95 | Monthly | `Stripe__Prices__PremiumMonthly` |
| Premium Annual | £549.95 | Yearly | `Stripe__Prices__PremiumAnnual` |
| Elite Monthly | £89.95 | Monthly | `Stripe__Prices__EliteMonthly` |
| Elite Annual | £899.95 | Yearly | `Stripe__Prices__EliteAnnual` |

Copy each **`price_...`** ID (not `prod_...`) from the product’s **Pricing** section.

Also set matching **`Plans__*`** amounts on Railway so the site and DB stay in sync:

| Env var | Value |
|---------|-------|
| `Plans__EssentialMonthly` | `29.95` |
| `Plans__EssentialAnnual` | `299.95` |
| `Plans__PremiumMonthly` | `54.95` |
| `Plans__PremiumAnnual` | `549.95` |
| `Plans__EliteMonthly` | `89.95` |
| `Plans__EliteAnnual` | `899.95` |

---

## 2. Set Railway variables

```text
Stripe__SecretKey=sk_test_... or sk_live_...
Stripe__WebhookSecret=whsec_...
Stripe__Prices__EssentialMonthly=price_...
Stripe__Prices__EssentialAnnual=price_...
Stripe__Prices__PremiumMonthly=price_...
Stripe__Prices__PremiumAnnual=price_...
Stripe__Prices__EliteAnnual=price_...
Stripe__Prices__EliteMonthly=price_...
Plans__EssentialMonthly=29.95
Plans__EssentialAnnual=299.95
Plans__PremiumMonthly=54.95
Plans__PremiumAnnual=549.95
Plans__EliteMonthly=89.95
Plans__EliteAnnual=899.95
Features__BypassStripeCheckout=false
```

Redeploy the API after saving. On startup, `ApplyStripePriceIdsAsync` maps Price IDs onto `SubscriptionPlans` in the database.

---

## 3. Webhook

Endpoint: `https://YOUR-RAILWAY-API/api/webhooks/stripe`

Events:

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

See [`deploy-staging.md`](deploy-staging.md) and [`stripe-local-setup.md`](stripe-local-setup.md).

---

## 4. Verify after deploy

- [ ] API logs: `Applied Stripe Price IDs from configuration to subscription plans` (or no error about invalid `prod_` IDs)
- [ ] `GET /api/brands/gardens-sorted/plans` - six plans, correct `priceGbp` values
- [ ] Signup **Essential Monthly** (small garden) → Stripe Checkout shows **£29.95/month**
- [ ] Signup **Premium Monthly** → **£54.95/month**
- [ ] Signup **Elite Monthly** → **£89.95/month**
- [ ] Signup **Essential Medium** → dynamic price **£39.95** (Price ID skipped; `price_data` used)
- [ ] Complete test payment → subscription **Active**, webhook `checkout.session.completed` **200**
- [ ] Customer portal → upgrade Essential → Premium works (Stripe subscription update)
- [ ] Billing portal opens from customer account

---

## 5. Common mistakes

| Mistake | Symptom |
|---------|---------|
| Pasted `prod_...` instead of `price_...` | API logs warning; ID ignored; dynamic pricing used |
| Old Premium prices (£49.95) in Stripe | Checkout amount mismatch vs website |
| Missing Elite Price IDs | Elite checkout uses dynamic pricing only |
| `Plans__*` out of sync with Stripe | Website shows wrong price; DB updated on startup |
| Webhook secret from CLI vs Dashboard | Signature verification fails in production |
| Forgot to redeploy after env change | Old config still running |

---

## 6. Alternative providers (GoCardless)

Stripe is integrated today. Direct Debit via **GoCardless** is a possible UK alternative for lower recurring fees - see [`payments-strategy.md`](payments-strategy.md). Do **not** remove Stripe env vars until a second provider is implemented; run parallel in staging first.
