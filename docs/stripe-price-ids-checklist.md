# Stripe Price IDs - pre-deploy checklist

Complete **before** taking real payments in staging or production.

**Plan reference:** [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md)

---

## How pricing works at checkout

| Checkout scenario | Stripe behaviour |
|-------------------|------------------|
| **Monthly** tier plan · **small garden** · **no add-ons** · catalog Price ID configured | Uses pre-defined **`price_...`** (Essential / Premium / Elite Monthly) |
| **Everything else** | Dynamic **`price_data`** computed from `GardenSizePricing` + tier uplift + add-ons |

**Dynamic checkout applies to:**

- Medium or large garden bands
- Signup add-ons (hedges, seasonal, patio)
- **Annual** billing (always dynamic)
- Any amount that does not exactly match the small-garden monthly catalog price

You only need **three** recurring Prices in Stripe Dashboard for the standard monthly tiers at small-garden base amounts. Optional annual Price IDs are ignored by checkout logic (annual always uses dynamic pricing).

---

## 1. Create three catalog prices (small garden, monthly)

| Plan name (DB) | Amount | Railway env var |
|----------------|--------|-----------------|
| Essential Monthly | **£59.99/mo** | `Stripe__Prices__EssentialMonthly` |
| Premium Monthly | **£84.99/mo** | `Stripe__Prices__PremiumMonthly` |
| Elite Monthly | **£119.99/mo** | `Stripe__Prices__EliteMonthly` |

Premium = Essential + **£25/mo**; Elite = Essential + **£60/mo** (10 / 20 / 30 visits per year).

**All other amounts** (garden band uplifts, add-ons, annual) are calculated in code and sent as dynamic `price_data` — no Stripe catalog entry required.

Also set **`Plans__*`** on Railway so DB seed/sync stays aligned:

| Env var | Value |
|---------|-------|
| `Plans__EssentialMonthly` | `59.99` |
| `Plans__EssentialAnnual` | `599.90` |
| `Plans__PremiumMonthly` | `84.99` |
| `Plans__PremiumAnnual` | `849.90` |
| `Plans__EliteMonthly` | `119.99` |
| `Plans__EliteAnnual` | `1199.90` |

Annual `Plans__*` values are used for display/DB sync; checkout uses dynamic annual amounts (10× monthly).

---

## 2. Set Railway variables (minimum)

```text
Stripe__SecretKey=sk_test_... or sk_live_...
Stripe__WebhookSecret=whsec_...
Stripe__Prices__EssentialMonthly=price_...
Stripe__Prices__PremiumMonthly=price_...
Stripe__Prices__EliteMonthly=price_...
Plans__EssentialMonthly=59.99
Plans__EssentialAnnual=599.90
Plans__PremiumMonthly=84.99
Plans__PremiumAnnual=849.90
Plans__EliteMonthly=119.99
Plans__EliteAnnual=1199.90
Features__BypassStripeCheckout=false
```

Optional: `Stripe__Prices__*Annual` can remain unset — annual checkout is always dynamic.

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

- [ ] API logs: `Applied Stripe Price IDs from configuration to subscription plans`
- [ ] Signup **Essential**, small garden, **10 visits/yr**, no add-ons → Stripe Checkout **£59.99/month** (catalog Price ID)
- [ ] Signup **Essential**, medium garden → dynamic **£79.99/month**
- [ ] Signup **Essential**, small garden, **with add-ons** → dynamic total (not catalog Price ID)
- [ ] Signup **Premium**, small garden → **£84.99/month** (catalog if no add-ons)
- [ ] Signup **annual** (when enabled) → dynamic **£599.90/yr** etc.
- [ ] Complete test payment → subscription **Active**, webhook **200**
- [ ] Billing portal opens from customer account

---

## 5. Common mistakes

| Mistake | Symptom |
|---------|---------|
| Pasted `prod_...` instead of `price_...` | API error or ID ignored |
| Legacy prices (£29.95) in Stripe catalog | Mismatch on small-garden monthly checkout |
| Expecting catalog Price for medium/large or add-ons | Normal — those paths are always dynamic |
| `Plans__*` out of sync with code | Wrong amounts on website |
| Webhook secret from CLI vs Dashboard | Signature verification fails in production |

---

## 6. Alternative providers (GoCardless)

See [`payments-strategy.md`](payments-strategy.md). Do **not** remove Stripe env vars until a second provider is implemented.
