# Multi-Property Solutions — Product Requirements

**Status:** Phase 1 shipped (2026-05-23)  
**Launch:** Same release window and geography as consumer GardensSorted (pilot coverage area)  
**Related:** [`sorted_cursor_ai_technical_spec_v_1.md`](../sorted_cursor_ai_technical_spec_v_1.md), [`development-roadmap.md`](development-roadmap.md)

---

## Summary

**Multi-Property Solutions** is a separate commercial track for people who manage **two or more properties** — private landlords, holiday-let owners, and letting agents. It is **not** a discount tier on consumer Essential/Premium subscriptions. Each account receives **personalised pricing** from calculation rules, **per-property visit requirements**, and **monthly invoicing in arrears** (not Stripe subscriptions).

Tenants never interact with the platform. One login maps to one multi-property account for v1.

---

## Audience

| Include | Notes |
|---------|--------|
| Private landlords | 2+ rental properties |
| Letting agents / property managers | Managing others’ homes |
| Holiday-let owners | Seasonal visit patterns supported in pricing rules |

**Minimum:** 2 properties always (cannot enquire with fewer).

**Geography:** Same service area as consumer signup at launch. Properties outside coverage may be **waitlisted** or flagged for ops to **find a gardener** — they do not block the whole enquiry.

---

## Naming & positioning

| Context | Label |
|---------|--------|
| Marketing | **Multi-Property Solutions** |
| URL | `/multi-property-solutions` |
| Account type | Multi-property account |
| Admin CRM | Multi-Property Solutions section (distinct from consumer customers) |

### Marketing copy (phase 1)

**Headline:** Garden care for every property you manage

**Subline:** Whether you own two holiday lets or manage dozens of rentals, tell us about your properties and we’ll put together a personalised plan and price.

**Body (short):**
- One account for every property you manage
- Personalised pricing based on your properties — not one-size-fits-all plans
- Per-property visit schedules that match how you let and maintain each home
- Monthly invoicing with card or BACS
- Tenants never need to sign up — you stay in control

**Phase 1 CTA:** Request a quote  
**Phase 2+ CTA:** Get an instant quote *(after AI pricing is live)*

**Disclaimer (all quote stages):** Prices shown are **indicative** and subject to review before your agreement is confirmed.

---

## Consumer vs multi-property

| | Consumer (homeowner) | Multi-Property Solutions |
|--|---------------------|--------------------------|
| Properties | Typically 1 | 2+ required |
| Pricing | Fixed Essential / Premium | Personalised from rules |
| Visits | Plan cadence (1 or 2 / month) | Per-property requirements |
| Billing | Stripe subscription | Monthly invoice in arrears |
| Minimum term | Plan minimum term | **3 months per property** |
| Payment | Card (Stripe Checkout) | Card if **&lt; £200/mo**; **BACS** if **≥ £200/mo** |
| Signup | `/signup` wizard | Separate journey, same look and feel |
| Tenants | N/A | Never platform users |

---

## Pricing & quoting

### Calculation inputs (all apply)

Rules to be defined in a separate **multi-property pricing calculator**; the platform must support these inputs:

1. **Number of properties** in the account
2. **Postcode / travel clustering** (efficiency across properties)
3. **Visit frequency** — per property (not account-wide default)
4. **Service level** — e.g. basic tidy vs full maintenance (per property)
5. **Garden size** — collected at enquiry and signup
6. **Seasonality** — e.g. holiday-let peak/off-peak patterns

### Quote behaviour

- **Indicative quote** shown to the customer; always labelled subject to review.
- **Phase 2+:** AI applies calculation rules and returns a quote **immediately** on submission.
- Every AI-generated quote is **queued for admin review** before the agreement is confirmed (customer sees indicative price; ops approve/adjust).
- Admin can **override pricing** at any time.

### Commitment & changes

| Rule | Detail |
|------|--------|
| Minimum term | **3 months per property** |
| Remove property mid-term | Customer still pays the **quoted amount** for that property for the commitment period |
| Add property | **Recalculates** account total; **new property gets its own 3-month lock-in** |
| Invoicing | **Monthly in arrears** |

---

## Enquiry & signup data

### Phase 1 — Enquiry form only

Collect:

- Contact: name, email, phone
- Optional: company / trading name (for agents)
- **Minimum 2 properties**, each with:
  - **Address** (line + postcode sufficient at this stage)
  - **Garden size** (Small / Medium / Large — same enum as consumer)
- Free-text notes (optional)

**Out of scope for phase 1:** instant quote, account creation, invoicing, portal.

Deliverables: admin notification, CRM lead record, email acknowledgement to enquirer.

### Phase 2+ — Multi-property signup (separate journey)

Same visual language as consumer signup. Customer builds the property list to **get a price**:

- Per property: address, garden size, **visit requirements** (frequency, service level, seasonality notes, access notes)
- Minimum 2 properties at signup
- AI returns indicative quote immediately → **pending review** state
- Bulk address import deferred to **portal (phase 3)**, not signup

---

## Portal (phase 3)

Account holder can:

- View **dashboard** — all properties, status, next visits, monthly spend
- Drill into **per-property** visits, requirements, access notes, assigned gardener
- See **consolidated spend** and savings vs standard consumer rates (when calculable)
- **Bulk import** properties (CSV or paste) — not available at initial signup
- Add properties (triggers recalc + new 3-month lock-in per property)
- Request removal of properties (subject to commitment billing rules)

Tenants do not receive logins or communications from the platform (landlord/agent is the sole account contact unless ops configures otherwise later).

---

## Billing (phase 4)

- **Invoicing**, not recurring Stripe subscriptions.
- **Monthly in arrears** against the active agreement.
- **&lt; £200/month total:** card payment (Stripe Invoicing or equivalent).
- **≥ £200/month:** BACS option.
- **Invoicee:** account holder; letting agents decide whether they or the property owner is billed (offline arrangement; platform invoices the account holder).

Separate **multi-property terms** (minimum term, BACS, cancellation, indicative quotes) — distinct from consumer `/terms` where appropriate.

---

## Admin / CRM

Dedicated **Multi-Property Solutions** area in admin (not mixed with consumer customer list):

- Enquiry leads and active multi-property accounts
- Enquiry pipeline: new → quoted → under review → accepted → active
- View/edit per-property requirements and **override pricing**
- Approve AI-generated quotes before agreement goes live
- Reporting similar to consumer CRM: account count, properties per account, MRR, churn — scoped to multi-property segment

---

## Workflows (to implement)

1. **Multi-property enquiry received** — log event, notify admin, ack email
2. **Quote generated** — AI + rules, indicative, pending review
3. **Quote approved / adjusted** — admin action, customer notified
4. **Agreement activated** — account + properties + visit schedules
5. **Monthly invoice generated** — arrears, card vs BACS routing
6. **Property added / removed** — recalc, lock-in rules, commitment billing
7. **Out-of-area property** — waitlist or ops “find a gardener” task

---

## Build phases (agreed)

| Phase | Scope | Status |
|-------|--------|--------|
| **1** | Marketing page `/multi-property-solutions`, enquiry form (2+ props, address + garden size), admin lead inbox | ✅ Shipped |
| **2** | Pricing calculator rules, AI indicative quote on signup, admin quote review queue | ⬜ Not started |
| **3** | Multi-property account + portal, per-property ops, bulk import | ⬜ Not started |
| **4** | Invoicing (monthly arrears), card &lt; £200 / BACS ≥ £200 | ⬜ Not started |

**Release:** Phase 1 ships at **consumer go-live** (same pre-launch gate). Later phases follow without a separate geographic expansion.

---

## Open items (implementation time)

- [ ] Document exact multi-property pricing formula (spreadsheet or calculator module)
- [ ] Draft multi-property-specific terms & conditions
- [ ] Choose Stripe Invoicing vs manual invoice + BACS reconciliation for phase 4
- [ ] Define “service level” enum/options per property in UI
- [ ] Define waitlist / find-a-gardener admin workflow for out-of-area properties

---

## How to update this document

When phases ship, update the phase table, link from the roadmap, and move detailed behaviour notes here from the master spec if the spec grows too large.
