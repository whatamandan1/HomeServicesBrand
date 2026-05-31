# Customer signup needs map

End-to-end map of what the customer signup journey requires: user steps, data, APIs, infrastructure, and post-payment behaviour.

**Entry:** `/signup` (`src/frontend/web/app/(marketing)/signup/page.tsx`)

**Related:** [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md), [`stripe-price-ids-checklist.md`](stripe-price-ids-checklist.md), [`development-roadmap.md`](development-roadmap.md)

---

## Journey overview

```mermaid
flowchart LR
  A[Step 0: Contact] --> B[Step 1: Plan]
  B --> C[Step 2: Property + password]
  C --> D[POST /api/auth/register/customer]
  D --> E{Stripe bypass?}
  E -->|Dev only| F[POST /api/dev/activate]
  E -->|Production| G[Stripe Checkout]
  F --> H[/portal]
  G --> I[/signup/success]
  I --> H
  H --> J[Upload stashed photos + visits scheduled]
```

| Phase | User goal | System outcome |
|-------|-----------|----------------|
| Lead capture | Start signup; recover abandoned flows | `SignupLeads` row (debounced + beacon on exit) |
| Account creation | Register with plan + property | User, Customer, Property, Subscription (`PendingPayment`) |
| Payment | Pay first invoice | Stripe subscription; webhook activates sub |
| Portal | Manage account | Visits generated; optional photos uploaded |

---

## Step 0 — Get started

**Purpose:** Identify the customer and start lead capture before plan selection.

| Field | Required | Validation | Stored on lead | Sent at register |
|-------|----------|------------|----------------|------------------|
| First name | Yes | Non-empty trim | Yes | Yes |
| Last name | Yes | Non-empty trim | Yes | Yes |
| Email | Yes | `isValidEmail` | Yes | Yes |

**Lead capture:** `useSignupLeadCapture` debounces (~900ms) to `POST /api/marketing/signup-leads` when name + email valid. Also sends on `pagehide` via `sendBeacon` / `fetch keepalive`.

**Lead payload:** email, firstName, lastName, `lastStep: 0`, optional plan/garden/postcode as user progresses, `sessionId` (browser session UUID).

**Admin:** Active leads appear under **Incomplete signups** on `/admin` (`SignupLeadList`).

---

## Step 1 — Choose plan

**Purpose:** Select billing interval, garden size, and tier (Essential / Premium / Elite).

| Choice | Required | Notes |
|--------|----------|-------|
| Billing interval | Implicit | Monthly or Annual (`BillingIntervalToggle`) |
| Garden size | Yes | Small / Medium / Large — drives price via `planPriceForGarden` |
| Plan tier | Yes | Maps to `SubscriptionPlanId` from API plans |

**Data sources:**

- `GET /api/plans` — live plans from DB (Stripe price IDs, visit cadence, minimum term)
- Fallback: `FALLBACK_PLANS` in UI if API unreachable (signup blocked if plan id starts with `fallback-`)
- Deep link: `?plan=<index>` pre-selects tier (annual billing)

**Lead updates:** `lastStep: 1`, `selectedPlanName`, `gardenSize`.

**Pricing rules:** See `src/frontend/web/lib/consumer-plans.ts` and backend `PlanPricing` / `PlanCatalog`.

---

## Step 2 — Finish signup

**Purpose:** Service address, visit availability, password, optional garden photos, terms acceptance.

| Field | Required | Validation | Register API field |
|-------|----------|------------|-------------------|
| Address line 1 | Yes | Non-empty | `line1` |
| Address line 2 | No | — | `line2` |
| City | Yes | Non-empty | `city` |
| Postcode | Yes | UK format (`isValidUkPostcode`, normalized) | `postcode` |
| Availability | Yes | Preset or free text | `availabilityPreference` |
| Password | Yes | Min length (`MIN_PASSWORD_LENGTH`) | `password` |
| Garden photos | No | Up to 3; compressed client-side | Not in register — stashed in `sessionStorage` |
| Terms | Implicit | Submit = accepted | `acceptedTerms: true` |

**Not collected at signup:** Phone (sent as empty string; welcome SMS skipped unless phone added later).

**Lead updates:** `lastStep: 2`, `postcode`.

---

## Registration API

**Endpoint:** `POST /api/auth/register/customer`

**Request:** `RegisterCustomerRequest` — email, password, names, phone, address, `gardenSize`, `subscriptionPlanId`, `availabilityPreference`, `acceptedTerms`, `brandCode` (default `gardens-sorted`).

**Backend effects** (`AuthService.RegisterCustomerAsync`):

1. Validate terms, last name, unique email, brand + plan exist
2. Create `UserAccount` (Customer role) + `Customer` (terms timestamp)
3. Create primary `CustomerProperty` (garden size, normalized postcode)
4. Create `CustomerSubscription` with status **PendingPayment**
5. Queue property geocoding (postcodes.io) for coverage/dispatch
6. Mark matching signup lead **Converted**
7. Send welcome email (and SMS if phone present) — async, non-blocking
8. Return JWT + `pendingSubscriptionId`

---

## Payment

**Public config:** `GET /api/config/public` → `bypassStripeCheckout` (true only when `IsDevelopment()` **and** `Features:BypassStripeCheckout`).

### Production path

1. `POST /api/customer/subscriptions/{id}/checkout` → Stripe Checkout (subscription mode)
2. Price resolved from plan + garden size (`PlanPricing.ResolvePrice`)
3. Metadata: `subscriptionId`, `planId`, `minimumTermMonths`
4. Pending `PaymentRecord` created
5. Optional photos stashed to `sessionStorage` before redirect
6. User returns to `Stripe:SuccessUrl` (default `/signup/success?session_id=…`)
7. Webhook `checkout.session.completed` → link Stripe IDs → `ActivateSubscriptionAsync`

**On activation:**

- Subscription → **Active**; minimum term end date set
- Payment → **Succeeded**
- `GenerateVisitsForSubscriptionAsync` + dispatch queue
- Subscription confirmed email (+ SMS if phone)

### Dev bypass path

1. `POST /api/dev/activate/{subscriptionId}` (development only)
2. Same activation side effects without Stripe
3. Redirect to `/portal`

### Login retry

If register fails with “already registered” or timeout, UI retries `login` + checkout with same password.

---

## Post-signup (portal)

**Route:** `/portal`

| Need | Implementation |
|------|----------------|
| Session | JWT from `saveAuth` after register (or login retry) |
| Stashed photos | `takeSignupPhotos()` on load → upload to primary property via `customerUploadPropertyPhoto` |
| Subscriptions | `GET /api/customer/subscriptions` |
| Visits | Shown after activation; cancel/reschedule separate from subscription cancel |
| Billing | Manage payment method via Stripe billing portal (new tab) |
| Support | `CustomerChatWidget` for account questions |

**Subscription cancellation:** Handled by support team (not self-serve in portal billing UI). Minimum term continues until end date.

---

## Infrastructure checklist

| Dependency | Purpose | Config |
|------------|---------|--------|
| PostgreSQL | Users, leads, subscriptions, visits | Connection string |
| Stripe | Checkout, renewals, billing portal | `Stripe:SecretKey`, price IDs per plan, `SuccessUrl`, `CancelUrl`, `BillingPortalReturnUrl`, webhook secret |
| postcodes.io | Property geocoding | Used by geocoding service (no key) |
| SendGrid | Welcome + subscription emails | Email options |
| Twilio | Welcome / confirmation SMS | Optional; phone not collected at signup today |
| Next.js API proxy | `/api/*` → backend | Deploy config |

**Production guard:** API refuses to start if `Features:BypassStripeCheckout=true` in production (`Program.cs`).

See also: [`stripe-local-setup.md`](stripe-local-setup.md), [`deploy-staging.md`](deploy-staging.md).

---

## Frontend components

| Component | Role |
|-----------|------|
| `signup/page.tsx` | Wizard orchestration |
| `SignupSummary` | Sticky plan/price summary (step ≥ 1) |
| `AvailabilityPicker` | Visit preference presets + free text |
| `BillingIntervalToggle` | Monthly / annual |
| `use-signup-lead.ts` | Lead debounce + beacon |
| `pending-signup-photos.ts` | Session storage for post-checkout uploads |
| `signup-utils.ts` | Email, postcode, password, tier helpers |

---

## Failure modes

| Scenario | Behaviour |
|----------|-----------|
| Plans API down | Fallback pricing shown; register fails until live plans load |
| Lead capture fails | Silent — does not block signup |
| Email already registered | Error + suggest login; auto-retry login + checkout |
| Stripe checkout abandoned | Account exists; subscription stays PendingPayment; login → checkout |
| Photo upload after payment fails | User can add photos in portal property section |
| Geocoding slow/fails | Background job; dispatch may use postcode/outcode fallback |

---

## Gaps / not in this flow

- Phone number at signup (field exists in API but UI sends `""`)
- Marketing opt-in (lead API supports it; UI always `false`)
- Garden size help when unsure — AI from customer photos and/or aerial/Maps estimation to suggest Small/Medium/Large band ([`development-roadmap.md`](development-roadmap.md) § Possible later improvements)
- Multi-property customer signup (separate `/multi-property-solutions` enquiry flow)
- Self-serve subscription cancellation in portal (support/chat only)
- Resume wizard from lead (admin visibility only; no customer “continue where you left off” link)

---

## Quick test checklist

1. Complete all 3 steps with valid UK postcode → Stripe Checkout (or dev bypass)
2. Verify lead appears in admin **Incomplete signups** after step 0, then **Converted** after register
3. After payment, portal shows Active subscription and upcoming visits
4. Optional: attach 1–3 photos at step 2 → confirm they appear on primary property after portal load
5. Abandon at step 1 → confirm lead retained with `lastStep` and plan name
