# Consumer plans & garden-size pricing

**Source of truth** for GardensSorted homeowner subscriptions.

**Last updated:** 2026-05-31 — single launch plan (garden band + add-ons)

---

## Launch offer (signup)

One subscription at signup: **garden care** — **10 visits per year**, priced by **garden size band** plus optional **add-ons**. Marketing label: *Garden care*; DB plan name: `Essential Monthly` (legacy naming).

**Premium / Elite** tiers are **inactive** at signup (`IsActive = false`) but remain in the database for existing subscribers. Tier upgrades are disabled until multi-tier plans return (`PlanCatalog.GetUpgradeTier` → `null`).

---

## Garden size bands

Maintained **lawn, beds, and edges** — not whole plot or large paved areas.

| Garden size | Provider time (on site) | Price / month | Provider pay / visit |
|-------------|-------------------------|---------------|----------------------|
| **≤50 m²** | **1 hour** | **£59.99** | **£20** |
| **≤100 m²** | **1.5 hours** | **£79.99** | **£30** |
| **≤150 m²** | **2 hours** | **£99.99** | **£40** |

Above **150 m²** → personalised quote.

**Cadence:** **10 visits per year** (~every 5–6 weeks). Provider monthly equivalent ≈ `(10 ÷ 12) × pay per visit`.

Implementation: `Sorted.Core/Plans/GardenSizePricing.cs`, `ProviderVisitPay.cs`, frontend `src/frontend/web/lib/consumer-plans.ts`.

---

### Monthly prices (launch)

| Garden | £/month |
|--------|---------|
| ≤50 m² | £59.99 |
| ≤100 m² | £79.99 |
| ≤150 m² | £99.99 |

Annual billing is **hidden at signup** for now; when enabled, checkout ≈ **10× monthly** (~two months free).

---

## Legacy tiers (not at signup)

| Tier | Visits / year | Status |
|------|----------------|--------|
| Essential | **10** | **Offered** (as garden care) |
| Premium | **20** | Inactive at signup |
| Elite | **30** | Inactive at signup |

Existing Premium/Elite subscriptions keep their visit cadence and pricing rules in code.

---

## Provider pay (internal)

Fixed **per completed visit** by garden band (all active subscriptions).

| Garden | £/visit | Essential £/mo equiv. (10 visits/yr) |
|--------|---------|--------------------------------------|
| ≤50 m² | £20 | ~£16.67 |
| ≤100 m² | £30 | ~£25.00 |
| ≤150 m² | £40 | ~£33.33 |

Configurable via `ProviderPayout` (`SmallVisitGbp`, `MediumVisitGbp`, `LargeVisitGbp`).

---

## What's included on every visit

Within the **maintained area** (lawn, planted beds, edges — not whole plot or large paving):

| Work | Included |
|------|----------|
| Lawn mowing and edging | Yes |
| Weeding in borders and planted beds | Yes |
| General garden clean-up and tidy | Yes |
| Light watering — pots, beds, obvious dry spots while on site | Yes |

Paid **signup add-ons** (hedge, seasonal, patio) are optional and billed separately.

### Signup add-ons (optional)

Each selected add-on is delivered on a **fixed schedule** (not every maintenance visit). The monthly subscription charge spreads the annual cost over 12 months.

| Add-on | Sessions / year |
|--------|-----------------|
| Hedge trim, seasonal tidy | **4** |
| Patio & path refresh | **2** |

Per session (by garden band): provider **£20/hr**, platform **£5/hr**, customer **£25/hr** of on-site time (1 hr at ≤50 m², 1.5 hr at ≤100 m², 2 hr at ≤150 m²).

| Garden | Per session (customer) | Example: hedges (4×/yr) / mo | Example: patio (2×/yr) / mo |
|--------|------------------------|------------------------------|---------------------------|
| ≤50 m² | £25 | £8.33 | £4.17 |
| ≤100 m² | £37.50 | £12.50 | £6.25 |
| ≤150 m² | £50 | £16.67 | £8.33 |

Provider is paid per add-on **session** when it is carried out (not on every core visit). Code: `SignupAddonPricing.cs`.

### Minimum term with add-ons

| Billing | Core only | With signup add-ons |
|---------|-----------|---------------------|
| Monthly | 3 months | **6 months** |
| Annual | 12 months | 12 months |

Code: `SubscriptionCommitment.cs`. Stripe checkout and `EndsAtUtc` use the effective minimum at activation.

### Cancellation and visit equalisation

Visits are **seasonal** (more in spring/summer, fewer in winter). If a customer cancels before receiving all paid visits (including add-on sessions), remaining visits in the notice period may be **reduced** so delivered work matches what was paid for. Example: signup in April, cancel in June — visits from June onward may be scaled back. Full policy: [`/terms`](/terms) §6–7.

**Water:** Customer provides **access** (working outdoor tap or agreed supply). **Gardener brings** hose or watering can. No separate watering-only visits.

**Gardeners:** Approved only after **ID**, **UK right-to-work** verification, **basic DBS** pass, and **their own relevant insurance**; they bring their own equipment — see [`provider-requirements.md`](provider-requirements.md).

**Green waste:** Customers **dispose of clippings themselves** or **provide a suitable council garden-waste bin** on collection day. We do not routinely haul green waste off site.

---

## Customer responsibilities (before each visit)

1. **Access** — gate unlocked, path clear, pets kept away from the garden.
2. **Clear lawn and beds** — no furniture, toys, tools, or branches in the way.
3. **Pet waste** picked up in maintained areas.
4. **Water** — working outdoor tap (gardener brings hose or watering can).
5. **Power** — socket reachable from the garden; indoor or outdoor is fine. Gardener brings **20 m+ extension lead**.
6. **Grass clippings** — customer bins them, or council garden-waste bin out on collection day.
7. **Account details** — address, garden size, and access notes kept up to date.

If these are not met, the visit may be marked incomplete without refund.

---

## Off-platform work (anti-circumvention)

While subscribed, and for **12 months** after the last visit arranged through GardensSorted, customers must **not** hire or pay gardeners **introduced through the platform** for the same maintenance work **outside** GardensSorted without written consent.

Documented in [`/terms`](/terms) (section 9). Signup acceptance records `TermsAcceptedAtUtc`.

---

## Operations

1. **Pre-deploy:** migration `20260529120000_ThreeGardenSizeBands`; update Stripe Price IDs for new small-garden amounts.
2. Legacy API values `XLarge` / `XXLarge` map to **Large** (`GardenSizeJsonConverter`).

---

## Related docs

- [`sorted_saas_forecast_garden_bands.xlsx`](../sorted_saas_forecast_garden_bands.xlsx) — regenerate: `python3 scripts/build_forecast_garden_bands.py`
- [`provider-requirements.md`](provider-requirements.md)
- [`first-month-marketing-plan.md`](first-month-marketing-plan.md)
