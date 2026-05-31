# VAT structure — principal vs agent

Reference for how UK VAT may apply to GardensSorted consumer subscriptions, how the financial model treats it today, and what would need to change to account for VAT on **platform margin only**.

**Last updated:** 2026-05-24  
**Status:** For accountant review — not adopted as filing or invoicing policy

---

## Disclaimer

This document is **internal planning guidance**, not tax or legal advice. VAT treatment depends on contracts, invoicing, money flow, and how the business operates in practice. **Confirm structure with a qualified UK accountant** before changing checkout, invoices, or HMRC returns.

---

## The question

For Essential (small garden), a customer pays **£29.95/month**. The self-employed gardener receives **£15/visit** (see [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md)). The platform keeps roughly **£14.95** before Stripe, ops, and marketing.

Should VAT (once registered) be charged on:

1. **Full customer price** (£29.95) — *principal* treatment, or  
2. **Platform margin only** (£14.95) — *agent / commission* treatment?

---

## Two models (summary)

| | **Principal** | **Agent / commission** |
|--|---------------|------------------------|
| **Who supplies the garden visit to the homeowner?** | GardensSorted | The matched gardener (platform arranges) |
| **Platform’s VATable turnover** | Full customer payment | Commission / platform fee only |
| **Provider payment (£15)** | Cost of sales | Gardener’s money passing through (not platform turnover) |
| **Essential small — VAT base (if 20% VAT-inclusive)** | ~£29.95 gross → ~£4.99 VAT element | ~£14.95 margin → ~£2.49 VAT element |
| **£90k registration threshold (simplified)** | Rolling **gross customer revenue** | Rolling **taxable commission**, not total cash collected |
| **Typical consumer marketplace default** | Yes — brand owns subscription | Possible, but requires deliberate legal + ops design |

**Self-employed gardeners** affects **their** tax, NIC, and possibly CIS — it does **not** by itself let the platform treat the £15 as non-turnover for VAT.

---

## HMRC position (high level)

HMRC does not let businesses choose “agent” for VAT convenience. Agency exists only if **both parties** are in a principal–agent relationship in law, and the **facts** match that — not just contract labels.

Useful HMRC internal manual references:

- [Agency overview (VTAXPER36580)](https://www.gov.uk/hmrc-internal-manuals/vat-taxable-person/vtaxper36580)
- [Six indicating factors (VTAXPER36820)](https://www.gov.uk/hmrc-internal-manuals/vat-taxable-person/vtaxper36820)
- [Employment bureaux — supply possibilities (VTAXPER67200)](https://www.gov.uk/hmrc-internal-manuals/vat-taxable-person/vtaxper67200) — analogous “introducer vs supplier of staff” analysis
- [Tax points for agents (VATTOS8300)](https://www.gov.uk/hmrc-internal-manuals/vat-time-of-supply/vattos8300)

### Six indicating factors (agency)

HMRC normally expects these in a true agency relationship:

1. **Title** — For goods, title stays with the principal. For services, who is clearly the supplier to the end customer?
2. **Separate consideration** — Agent’s fee/commission identifiable from the main supply; no “secret profit”.
3. **Authority** — Agent acts within agreed authority of the principal.
4. **Principal’s risk** — Commercial risk on the principal for the main supply where applicable.
5. **Agent does not alter the supply** — Agent facilitates; principal makes the supply.
6. **Consistency** — Written terms and **actual behaviour** align over time.

If factors point to **principal**, VAT is on the **full value** of the supply to the customer. If **agency** is established, proceed to agent accounting rules (VAT on commission; principal’s element handled separately).

For any given supply, the business is **either** principal **or** agent — not both on the same supply (see employment bureau guidance).

---

## Essential economics (small garden, illustrative)

Per visit / month (1 visit on Essential):

| Line | Principal view | Agent view (if valid) |
|------|----------------|------------------------|
| Customer pays | £29.95 | £29.95 (collected) |
| Gardener receives | £15.00 (platform cost) | £15.00 (gardener’s consideration) |
| Platform margin (pre Stripe/ops) | £14.95 | £14.95 (commission) |
| **VAT base (if registered, VAT-inclusive prices)** | ~£29.95 | ~£14.95 |
| **VAT element at 20% (approx.)** | ~£4.99 | ~£2.49 |

Premium and Elite scale similarly: provider pay is **visits × per-visit rate** (£18 / £20 / £25 / £30 by garden band); platform margin is customer price minus blended provider cost. See [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md).

---

## How GardensSorted looks today (principal indicators)

Based on current product and commercial setup:

| Signal | Implication |
|--------|-------------|
| **GardensSorted** plan names and pricing (Essential / Premium / Elite) | Platform is the commercial face of the product |
| Checkout via **Stripe** to Sorted subscription prices | Customer pays the platform |
| Gardeners **matched** by platform; visit pay set by platform | Platform controls economics |
| Consumer terms position Sorted as service organiser | Needs lawyer/accountant review — may still be principal |
| Financial model: gross revenue = customer cash; provider pay = cost | Matches **principal** planning |

**Working assumption for forecasting:** **principal** — VAT on gross customer revenue once registered. This is **conservative** (higher VAT than agent structure).

---

## What would be needed to structure as agent (margin VAT)

Only pursue after professional advice. Typical requirements:

### 1. Customer contract

- Homeowner’s contract for garden maintenance is with the **gardener** (or their business), not GardensSorted as supplier.
- GardensSorted acts as **disclosed agent** — collecting payment and charging a commission.

### 2. Transparent commission

- Platform fee must be **separable** from the visit price (not an undisclosed markup).
- Terms must establish how commission is calculated (e.g. % or fixed platform fee per visit).

### 3. Invoicing

- Invoices should reflect the gardener as **supplier** of the maintenance, or use **agent invoicing** on the gardener’s behalf where appropriate (see VAT Act 1994 s.47 — agent acting in own name).
- A single invoice for “GardensSorted Essential £29.95” with no supplier disclosure weakens the agent argument.

### 4. Money flow and accounts

- Customer receipts split conceptually (and ideally in reporting): **gardener portion** vs **commission**.
- Accounts should not treat the full £29.95 as platform turnover if claiming agent status.
- Stripe/settlement reporting may need to support the split for audit.

### 5. Operational consistency

- Marketing, support, complaints handling, and liability must align with agency (who is responsible for the visit?).
- **Mixed models** on the same subscription (platform acts as principal in practice but agent on paper) create HMRC risk.

### 6. Gardener-side compliance

- Gardeners remain responsible for their own tax/NIC (and **CIS** may apply to payments for construction/gardening-type work — separate from VAT but relevant in the same conversation).
- VAT-registered gardeners may charge VAT on amounts invoiced **to the platform** or **to the customer**, depending on structure — another reason for unified professional advice.

---

## Alternative structures (for accountant discussion)

| Structure | VAT on | UX / complexity |
|-----------|--------|-----------------|
| **A. Principal (current)** | Full subscription price | Simplest; matches brand-led subscription |
| **B. Disclosed agency** | Commission only | Possible with gardener-as-supplier terms; harder with rotating gardeners and subscriptions |
| **C. Introduction fee** | Booking/admin fee only; gardener bills customer separately | Clean VAT split; poor fit for seamless monthly subscription |

---

## Case study: how Uber handles VAT in the UK

Uber is the closest large-scale analogy to a platform collecting customer payment and paying self-employed providers. It shows that **margin-only VAT is possible in theory**, but Uber’s outcome depends on **licensing law, contracts, and court rulings** — not simply because drivers are self-employed.

### What HMRC allows (private hire sector)

[VAT Notice 700/25](https://www.gov.uk/guidance/vat-notice-70025-how-vat-applies-to-taxis-and-private-hire-cars) sets out two models for private hire vehicle operators (PHVOs):

| Model | VAT accounted for by the operator |
|--------|-----------------------------------|
| **Principal** | **Full passenger fare** |
| **Agent** | **Platform fee / commission** charged to drivers (and any other agent fees, e.g. vehicle rental). The **driver** accounts for VAT on the fare if VAT-registered. |

Garden care is **not** private hire — GardensSorted is not governed by Notice 700/25. The general agency/principal rules in this document still apply. Uber is useful as a **precedent for how HMRC and the courts treat marketplaces**, not as a direct rule for gardening.

### Uber London — principal, VAT on full fare

**Uber London** (TfL-licensed under the Private Hire Vehicles (London) Act 1998) is required to contract as **principal** with the passenger.

Following the **February 2021 Supreme Court** ruling (Uber drivers as workers, not independent contractors) and related High Court decisions, HMRC’s view aligned with **Uber as supplier**, not the driver as a separate supplier to the passenger.

From **March 2022**, Uber charges **20% VAT on the full ride fare** in London. Uber also settled a large historical VAT bill with HMRC (reported at around **£615 million**).

**Parallel for GardensSorted:** brand-led product, platform checkout, platform sets economics → looks more like **Uber London / principal** than regional agent.

### Uber outside London — agent vs principal was litigated for years

For **Uber Britannia** and other operators licensed under the Local Government (Miscellaneous Provisions) Act 1976 (outside London):

| Stage | Outcome |
|--------|---------|
| **2023 High Court** (*Uber Britannia v Sefton*) | Operator must contract as **principal** → full fare VAT implied |
| **July 2024 Court of Appeal** | Overturned High Court — operators **outside London can act as agents** |
| **July 2025 Supreme Court** | Upheld Court of Appeal — PHOs can **choose** agent or principal contracting (outside London) |

In **agent** mode: Uber accounts for VAT on **fees charged to drivers**, not the full fare. Drivers handle VAT on fares if over the registration threshold.

The government’s [2024 PHV VAT consultation response](https://assets.publishing.service.gov.uk/media/6925a77e33d088f6d5da2cf5/VAT_on_PHVs_Consultation_-_Summary_of_Response.pdf) was largely parked pending this litigation. **London remains principal-only** under its licensing regime.

**Parallel for GardensSorted:** an agent/margin-VAT structure is **legally possible** for some platforms, but requires contracts and behaviour that support agency — and may still be challenged by HMRC.

### HMRC dispute over Tour Operators’ Margin Scheme (TOMS)

Uber also argued **TOMS** (Tour Operators’ Margin Scheme) to reduce the VAT base on bundled supplies. HMRC challenged this separately (reported additional assessment of around **£386 million**). This is a third approach — neither pure “full fare” nor simple “commission only” — and HMRC pushed back.

**Takeaway:** even Uber’s structures have been **contested, revised, and settled** under HMRC pressure. Margin VAT is not a set-and-forget configuration.

### Lessons for GardensSorted

| Uber lesson | Implication for Sorted |
|-------------|------------------------|
| Self-employed providers **≠** automatic agent treatment | Gardener self-employment alone does not justify VAT on £14.95 only |
| **London Uber** = forced **principal**, full fare VAT | Sorted-branded subscription + Stripe checkout ≈ **principal** planning default |
| **Regional Uber** = **agent allowed** where law + contracts support it | Would need gardener-as-supplier terms, invoicing, and money-flow split |
| Employment / control cases pushed Uber toward **principal** | High platform control over pricing and service increases principal risk |
| Sector-specific PHV rules **≠** gardening | Cannot rely on Uber’s PHV outcome; need advice on general VAT agency rules |
| HMRC actively challenges platform VAT positions | Conservative model (VAT on gross) is appropriate until adviser sign-off |

---

## Financial model treatment

**File:** [`sorted_saas_recurring_revenue_forecast_v3_elite.xlsx`](../sorted_saas_recurring_revenue_forecast_v3_elite.xlsx)  
**Rebuild script:** [`scripts/build_saas_forecast_v3_elite.py`](../scripts/build_saas_forecast_v3_elite.py)

### Current behaviour (toggle on Inputs B66)

| `VATAgentMode` | Mode | VAT base | Registration threshold |
|----------------|------|----------|------------------------|
| **0** (default) | **Principal** | Full `GrossRev` | Rolling 12-month gross revenue |
| **1** | **Agent** | `GrossRev - Prov` (platform margin) | Rolling 12-month platform margin |

| Step | Principal (0) | Agent (1) |
|------|---------------|-----------|
| **Net revenue** | `GrossRev / (1 + VATRate)` when registered | `GrossRev - VAT on margin` |
| **VAT accrued** | `GrossRev - NetRev` | VAT on margin only |
| **Provider pay** | Deducted in profit (unchanged) | Same |
| **Profit** | `NetRev - Prov - fees - opex` | Same structure |

**Sheet `VAT Comparison`** shows both treatments side-by-side (years 1–5) without changing the toggle.

### Possible future enhancement (not yet built)

Add separate invoicing / gardener pass-through lines for agent mode in cash flow reporting.

---

## Questions for accountant / tax adviser

Take this document and ask:

1. For our homeowner subscriptions, are we **principal** or **disclosed agent** for VAT?
2. If agent, what must change in **terms, invoices, Stripe receipts, and gardener agreements**?
3. Does **CIS** apply to gardener payments, and how does that interact with VAT planning?
4. What amount counts toward the **£90,000 VAT registration threshold** in each structure?
5. If we remain **principal** for launch, is there a **later restructuring** path that is HMRC-defensible without breaking subscription UX?
6. How should **annual vs monthly** billing and **plan upgrades** be invoiced under the chosen structure?
7. Do **medium/large garden uplifts** change the analysis (same structure, different amounts)?

---

## Decision log

| Date | Decision | Notes |
|------|----------|-------|
| 2026-05-26 | Model v4 | 10/20/30 visits per year; provider pay reduced; VAT agent toggle + VAT Comparison sheet |
| 2026-05-24 | Document created | Principal assumed in financial model; agent option documented for review |
| 2026-05-24 | Uber UK case study added | London = principal/full fare; regional PHV = agent possible; not direct precedent for gardening |
| | Accountant review | *Pending* |
| | VAT basis in model | **Toggle** on Inputs B66 — default Principal (0) |
| | Invoicing / terms update | *Not started* |

---

## Related docs

- [VAT Notice 700/25 — taxis and private hire](https://www.gov.uk/guidance/vat-notice-70025-how-vat-applies-to-taxis-and-private-hire-cars) — Uber PHV context (not gardening)
- [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md) — customer prices and provider visit pay
- [`payments-strategy.md`](payments-strategy.md) — Stripe checkout and billing
- [`sorted_financial_model_framework_v_1.md`](../sorted_financial_model_framework_v_1.md) — broader model scope (§10 VAT and business structure)
