# Consumer plans & garden-size pricing

Product reference for GardensSorted homeowner subscriptions (Essential and Premium).

**Last updated:** 2026-05-24 (watering & seasonal add-ons)

---

## Plans overview

| | Essential | Premium |
|--|-----------|---------|
| **Visits** | 1 per month (~every 30 days) | 2 per month (~every 15 days) |
| **Best for** | Keeping a tidy garden with regular upkeep | Faster-growing gardens or owners who want more frequent care |
| **Minimum term** | 3 months (monthly) / 12 months (annual) | Same |

Listed prices are for a **small** garden. Medium and large gardens add a fixed uplift (see below).

---

## What's included

### Essential (every visit)

- Lawn mowing and edging
- Light border and bed tidy
- Grass clippings removed from site
- Work scoped to the garden size selected at signup

### Premium (every visit)

Everything in Essential, plus:

- Light hedge trim and shaping (where safely accessible from ground level)
- Weeding in planted beds
- Seasonal tidy — leaves, light pruning, general neatening

### All plans — while we're on site

When time and access allow during a **scheduled visit** (not as separate call-outs):

- **Watering** — pots, containers, and obvious dry spots if you have an outdoor tap and hose
- **Paths & patio** — light sweep of garden-adjacent paving (not a full deep clean)

We do **not** make extra trips between visits just for watering or patio work.

### Premium — seasonal (in season, on visit days)

- Leaf blow and clear within the maintained garden area (especially autumn)
- Light pruning and general seasonal neatening (already part of Premium tidy)

### Optional seasonal add-ons (quoted / booked separately)

These are **not** in the standard subscription price — customers can ask us to arrange them:

| Add-on | Notes |
|--------|--------|
| **Patio & deck cleaning** | Thorough clean / pressure wash beyond a light on-visit sweep |
| **Leaf clearance** | Large volumes, whole-property, or extra visits in peak autumn |
| **Gutter clearing** | Separate job — height, access, and insurance assessed; often a different specialist |

Future: optional seasonal packs or landlord bundles (see multi-property track).

### Not included (quote separately)

- Tree surgery or large branch removal
- Tall hedge reduction requiring ladders/platforms
- Major clearance, landscaping, or hard landscaping
- Pest/disease treatment or specialist horticulture
- Waste beyond normal visit clippings (e.g. full garden clearances)
- **Dedicated** watering, patio, leaf, or gutter visits outside scheduled maintenance
- Irrigation system install, repair, or programming

### All plans — account & support

- Vetted local gardeners matched to your postcode
- Visits scheduled in your preferred time window (weekday mornings/afternoons/evenings where possible)
- Online account — view visits, reschedule, billing, and support chat
- Email support and in-account customer service

---

## Garden size definitions

Customers choose **Small**, **Medium**, or **Large** at signup. We use this to price fairly and allocate enough time on site.

| Size | Maintained area (guide) | Typical examples |
|------|-------------------------|------------------|
| **Small** | Up to ~100 m² lawn + borders combined | Courtyard, terrace, compact town garden |
| **Medium** | ~100–250 m² | Standard suburban rear garden |
| **Large** | ~250 m²+ or extensive planting | Large lawns, long borders, multiple zones |

If your garden is between sizes, choose the closest fit — we can adjust after the first visit if needed.

---

## Price matrix (GBP)

Base prices are configured in `Plans__*` env vars and seeded plans. Garden-size uplifts are applied at checkout and for provider earnings.

### Monthly billing

| Garden size | Essential | Premium |
|-------------|-----------|---------|
| Small | £29.95 | £49.95 |
| Medium | £39.95 (+£10) | £59.95 (+£10) |
| Large | £49.95 (+£20) | £69.95 (+£20) |

### Annual billing (~2 months free vs paying monthly)

| Garden size | Essential | Premium |
|-------------|-----------|---------|
| Small | £299.95 | £499.95 |
| Medium | £399.95 (+£100) | £599.95 (+£100) |
| Large | £499.95 (+£200) | £699.95 (+£200) |

### Uplift rules (code)

- Monthly: Medium **+£10**, Large **+£20**
- Annual: Medium **+£100**, Large **+£200**

Implementation: `Sorted.Core/Plans/ConsumerPlanPricing.cs`, frontend mirror in `src/frontend/web/lib/consumer-plans.ts`.

When a fixed Stripe Price ID is configured, it applies to **small gardens only**; medium/large checkout uses dynamic Stripe `price_data` with the uplifted amount.

---

## Provider pay (internal)

Provider visit earnings use the **customer's actual plan price** (including garden-size uplift), 60% provider share ÷ visits per month:

| Plan + size (monthly) | Approx. per visit |
|-----------------------|-------------------|
| Essential Small £29.95 | ~£17.97 |
| Essential Large £49.95 | ~£29.97 |
| Premium Small £49.95 | ~£14.99 |
| Premium Large £69.95 | ~£20.99 |

---

## Related docs

- [`development-roadmap.md`](development-roadmap.md) — build status
- [`multi-property-solutions-requirements.md`](multi-property-solutions-requirements.md) — landlord track (separate pricing model)
