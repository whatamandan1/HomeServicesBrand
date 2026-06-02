# Stripe Price IDs - pre-deploy checklist

Complete **before** taking real payments in staging or production.

**Plan reference:** [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md)

---

## How pricing works at checkout

| Checkout scenario | Stripe behaviour |
|-------------------|------------------|
| **Small garden** (≤50 m²) + plan has `StripePriceId` | Uses configured **`price_...`** |
| **Medium / large garden**, **Premium / Elite tier**, or **signup add-ons** | Dynamic **`price_data`** from `GardenSizePricing` + tier uplift + add-ons |

Fixed Price IDs are optional but recommended for **small-garden Essential Monthly** (highest-volume path) so Stripe Dashboard reconciliation is cleaner. All other combinations work via dynamic pricing without Price IDs.

---

## 1. Small-garden anchor prices (≤50 m² maintained)

These match `appsettings.json` → `Plans` and migration `20260529120000_ThreeGardenSizeBands`.

| Plan name (DB) | Monthly | Annual (10× monthly) | Railway env var |
|----------------|---------|----------------------|-----------------|
| Essential Monthly | **£59.99** | — | `Stripe__Prices__EssentialMonthly` |
| Essential Annual | — | **£599.90** | `Stripe__Prices__EssentialAnnual` |
| Premium Monthly | **£84.99** | — | `Stripe__Prices__PremiumMonthly` |
| Premium Annual | — | **£849.90** | `Stripe__Prices__PremiumAnnual` |
| Elite Monthly | **£119.99** | — | `Stripe__Prices__EliteMonthly` |
| Elite Annual | — | **£1199.90** | `Stripe__Prices__EliteAnnual` |

Premium = Essential band price + **£25/mo**; Elite = Essential band price + **£60/mo**.

**Medium / large garden uplifts** (dynamic checkout only):

| Band | Essential monthly | Provider pay / visit |
|------|-------------------|----------------------|
| ≤50 m² | £59.99 | £20 |
| ≤100 m² | £79.99 | £30 |
| ≤150 m² | £99.99 | £40 |

Create Stripe **Products → Prices** in **test mode** first, then repeat in **live mode** before go-live. Copy each **`price_...`** ID (not `prod_...`).

Also set matching **`Plans__*`** on Railway so DB seed/sync stays aligned:

| Env var | Value |
|---------|-------|
| `Plans__EssentialMonthly` | `59.99` |
| `Plans__EssentialAnnual` | `599.90` |
| `Plans__PremiumMonthly` | `84.99` |
| `Plans__PremiumAnnual` | `849.90` |
| `Plans__EliteMonthly` | `119.99` |
| `Plans__EliteAnnual` | `1199.90` |

---

## 2. Set Railway variables

```text
Stripe__SecretKey=sk_test_... or sk_live_...
Stripe__WebhookSecret=whsec_...
Stripe__Prices__EssentialMonthly=price_...
Stripe__Prices__EssentialAnnual=price_...
Stripe__Prices__PremiumMonthly=price_...
Stripe__Prices__PremiumAnnual=price_...
Stripe__Prices__EliteMonthly=price_...
Stripe__Prices__EliteAnnual=price_...
Plans__EssentialMonthly=59.99
Plans__EssentialAnnual=599.90
Plans__PremiumMonthly=84.99
Plans__PremiumAnnual=849.90
Plans__EliteMonthly=119.99
Plans__EliteAnnual=1199.90
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
- [ ] `GET /api/brands/gardens-sorted/plans` - six plans; Essential Monthly `priceGbp` = **59.99**
- [ ] Signup **Essential**, small garden, **10 visits/yr** → Stripe Checkout **£59.99/month**
- [ ] Signup **Essential**, medium garden → dynamic **£79.99/month** (Price ID skipped)
- [ ] Signup **Premium**, small garden, **20 visits/yr** → **£84.99/month**
- [ ] Signup **Elite**, small garden, **30 visits/yr** → **£119.99/month**
- [ ] Signup with add-ons → checkout total includes add-on monthly uplift
- [ ] Complete test payment → subscription **Active**, webhook `checkout.session.completed` **200**
- [ ] Billing portal opens from customer account
- [ ] In-portal tier upgrade: **disabled** today (`PlanCatalog.GetUpgradeTier` → `null`) — do not test upgrade flow until re-enabled

---

## 5. Common mistakes

| Mistake | Symptom |
|---------|---------|
| Pasted `prod_...` instead of `price_...` | API logs warning; ID ignored; dynamic pricing used |
| Legacy prices (£29.95 / £49.95) still in Stripe | Checkout amount mismatch vs website |
| `Plans__*` out of sync with Stripe / code | Website shows wrong price; DB updated on startup |
| Expecting Price IDs for medium/large gardens | Normal — those paths always use dynamic `price_data` |
| Webhook secret from CLI vs Dashboard | Signature verification fails in production |
| Forgot to redeploy after env change | Old config still running |

---

## 6. Alternative providers (GoCardless)

Stripe is integrated today. Direct Debit via **GoCardless** is a possible UK alternative for lower recurring fees - see [`payments-strategy.md`](payments-strategy.md). Do **not** remove Stripe env vars until a second provider is implemented; run parallel in staging first.
