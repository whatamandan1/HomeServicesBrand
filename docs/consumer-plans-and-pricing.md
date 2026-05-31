# Consumer plans & garden-size pricing

**Source of truth** for GardensSorted homeowner subscriptions.

**Last updated:** 2026-05-30 — visit scope, customer prep, off-platform terms

---

## Garden size bands (Essential)

Maintained **lawn, beds, and edges** — not whole plot or large paved areas.

| Garden size | Provider time (on site) | Price / month | Provider pay / visit |
|-------------|-------------------------|---------------|----------------------|
| **≤50 m²** | **1 hour** | **£59.99** | **£20** |
| **≤100 m²** | **1.5 hours** | **£79.99** | **£30** |
| **≤150 m²** | **2 hours** | **£99.99** | **£40** |

Above **150 m²** → personalised quote.

**Essential cadence:** **10 visits per year** (~every 5–6 weeks). Provider monthly equivalent ≈ `(10 ÷ 12) × pay per visit`.

Implementation: `Sorted.Core/Plans/GardenSizePricing.cs`, `ProviderVisitPay.cs`, frontend `src/frontend/web/lib/consumer-plans.ts`.

---

## Plan tiers (monthly price = garden band + addon)

Premium and Elite add a fixed amount on top of the **same garden band** price:

| Addon | £/month |
|-------|---------|
| Premium | **+£25** |
| Elite | **+£60** |

### Example monthly prices (Essential band)

| Garden | Essential | Premium | Elite |
|--------|-----------|---------|-------|
| ≤50 m² | £59.99 | £84.99 | £119.99 |
| ≤100 m² | £79.99 | £104.99 | £139.99 |
| ≤150 m² | £99.99 | £124.99 | £159.99 |

### Annual billing

Annual checkout ≈ **10× monthly** (~two months free vs paying every month).

| Garden | Essential annual |
|--------|------------------|
| ≤50 m² | £599.90 |
| ≤100 m² | £799.90 |
| ≤150 m² | £999.90 |

---

## Visits per year

| Tier | Visits / year |
|------|----------------|
| Essential | **10** |
| Premium | **20** |
| Elite | **30** |

---

## Provider pay (internal)

Fixed **per completed visit** by garden band (same for Essential, Premium, Elite).

| Garden | £/visit | Essential £/mo equiv. (10 visits/yr) |
|--------|---------|--------------------------------------|
| ≤50 m² | £20 | ~£16.67 |
| ≤100 m² | £30 | ~£25.00 |
| ≤150 m² | £40 | ~£33.33 |

Configurable via `ProviderPayout` (`SmallVisitGbp`, `MediumVisitGbp`, `LargeVisitGbp`).

---

## What's included on every visit (all tiers)

Within the **maintained area** (lawn, planted beds, edges — not whole plot or large paving):

| Work | Included |
|------|----------|
| Lawn mowing and edging | Yes |
| Weeding in borders and planted beds | Yes |
| General garden clean-up and tidy | Yes |
| Light watering (pots, beds, obvious dry spots — while on site) | Yes |

**Premium** adds 20 visits/year, light hedge trim, and seasonal tidy. **Elite** adds 30 visits/year and patio/path refresh.

### Signup add-ons (extra cost, same plan tier)

Add-ons do **not** change Essential / Premium / Elite — only **visit frequency** sets the tier. Each add-on is delivered on a **fixed schedule** (not every maintenance visit). The **monthly subscription charge** spreads the annual cost over 12 months.

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

**Gardeners:** Approved only after **ID**, **UK right-to-work** verification, and **basic DBS** pass; they bring their own equipment — see [`provider-requirements.md`](provider-requirements.md).

**Green waste:** Customers **dispose of clippings themselves** or **provide a suitable council garden-waste bin** on collection day. We do not routinely haul green waste off site.

---

## Customer responsibilities (before each visit)

1. Clear lawn and garden of **obstructions** (furniture, toys, tools, branches).
2. **Remove or secure pet waste** from maintained areas.
3. **Safe access** to the garden (gates, paths, pets secured).
4. **Access to water** — outdoor tap or supply (gardener brings hose or watering can).
5. **Outdoor power** where electric tools are needed.
6. Accurate address, garden size band, and access notes in the account.

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
