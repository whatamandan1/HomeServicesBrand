# GardensSorted — Email & SMS inventory

Complete registry of customer, provider, and ops communications for **marketing** and **operations**.

**Last updated:** 2026-06-01  
**Related:** [`marketing-plan.md`](marketing-plan.md), [`first-month-marketing-plan.md`](first-month-marketing-plan.md), [`signup-needs-map.md`](signup-needs-map.md), [`twilio-sms-setup.md`](twilio-sms-setup.md)

---

## Summary

| Category | Email | SMS | Status |
|----------|-------|-----|--------|
| **Live (transactional)** | 8 | 4 | Implemented in SendGrid / Twilio |
| **Marketing (planned)** | 9 | 2 | Not automated yet — month 1 uses manual follow-up for abandoners |
| **Operations (planned)** | 12 | 6 | Gaps in billing, visit lifecycle, provider dispatch |
| **Internal / ops alerts** | 6 | 0 | Partial — portfolio enquiry only |

**Sender defaults**

| Channel | From | Notes |
|---------|------|-------|
| Email (transactional) | `hello@gardenssorted.co.uk` / GardensSorted | SendGrid |
| Email (marketing) | Same or `news@gardenssorted.co.uk` | TBD — needs marketing automation tool |
| SMS | Twilio UK number (prod) or alphanumeric `GardensSorted` | Phone not collected at signup today — SMS only if phone on file |

**Compliance**

- Transactional: no opt-in required (account/service messages).
- Marketing: only to contacts with `MarketingOptIn = true` (field exists on signup leads; UI not wired yet).
- All SMS: include brand name; keep under 160 chars where possible.
- Unsubscribe link required on marketing email.

---

## 1. Live today (implemented)

These are wired in `SendGridEmailService` and `TwilioSmsService`.

### 1.1 Customer — account & onboarding

| ID | Channel | Trigger | Timing | Status |
|----|---------|---------|--------|--------|
| `CUST-WELCOME-EMAIL` | Email | `POST /api/auth/register/customer` | Immediate (async) | ✅ Live |
| `CUST-WELCOME-SMS` | SMS | Same, if phone on account | Immediate | ✅ Live (skipped today — no phone at signup) |
| `CUST-SUB-CONFIRM-EMAIL` | Email | Stripe `checkout.session.completed` / dev activate | Immediate | ✅ Live |
| `CUST-SUB-CONFIRM-SMS` | SMS | Same, if phone on account | Immediate | ✅ Live |
| `CUST-PWD-RESET-EMAIL` | Email | `POST /api/auth/forgot-password` | Immediate | ✅ Live |

**CUST-WELCOME-EMAIL**

- **Subject:** Welcome to GardensSorted
- **Body:**
  > Hi {firstName},
  >
  > Welcome to GardensSorted — we're glad you're here.
  >
  > Your account is ready. Complete payment to activate your garden care plan, or sign in to your portal to manage your details.
  >
  > {portalLink}
  >
  > Questions? Reply to this email or use the chat in your account.
  >
  > — The GardensSorted team

**CUST-WELCOME-SMS**

> Hi {firstName}, welcome to GardensSorted! Your garden subscription account is ready.

**CUST-SUB-CONFIRM-EMAIL**

- **Subject:** Your GardensSorted subscription is active
- **Body:**
  > Hi {firstName},
  >
  > Your {planName} subscription is now active.
  >
  > We're scheduling your visits based on your availability ({availabilityPreference}). Your first visit will be within 14 days — we'll confirm the date once a gardener is assigned.
  >
  > View upcoming visits: {portalLink}
  >
  > — The GardensSorted team

**CUST-SUB-CONFIRM-SMS**

> GardensSorted: your {planName} subscription is active. We'll confirm your first visit window soon.

**CUST-PWD-RESET-EMAIL**

- **Subject:** Reset your GardensSorted password
- **Body:**
  > Hi,
  >
  > We received a request to reset your GardensSorted password. Open this link within the next hour:
  >
  > {resetUrl}
  >
  > If you didn't request this, you can ignore this email.
  >
  > — The GardensSorted team

---

### 1.2 Customer — visit lifecycle

| ID | Channel | Trigger | Timing | Status |
|----|---------|---------|--------|--------|
| `CUST-VISIT-CLAIMED-EMAIL` | Email | Provider claims visit | Immediate | ✅ Live |
| `CUST-VISIT-CLAIMED-SMS` | SMS | Same, if phone | Immediate | ✅ Live |
| `CUST-VISIT-REMINDER-EMAIL` | Email | Background job `SendDueVisitRemindersAsync` | ~24h before visit | ✅ Live |
| `CUST-VISIT-REMINDER-SMS` | SMS | Same, if phone | ~24h before visit | ✅ Live |

**CUST-VISIT-CLAIMED-EMAIL**

- **Subject:** Your GardensSorted visit is confirmed
- **Body:**
  > Hi {firstName},
  >
  > Your garden visit on **{visitDate:dddd d MMMM}** at **{postcode}** is confirmed.
  >
  > Your gardener will arrive during **{availabilityWindow}**.
  >
  > Need to reschedule? Sign in to your portal: {portalLink}
  >
  > — The GardensSorted team

**CUST-VISIT-CLAIMED-SMS**

> GardensSorted: visit confirmed for {visitDate:dd MMM} in {postcode}. Your gardener will arrive in your chosen window.

**CUST-VISIT-REMINDER-EMAIL**

- **Subject:** Reminder: your GardensSorted visit is coming up
- **Body:**
  > Hi {firstName},
  >
  > A quick reminder: your garden visit is scheduled for **{visitDate:dddd d MMMM}** at **{postcode}**.
  >
  > We'll arrive during **{availabilityWindow}**. Please ensure we have access to the garden.
  >
  > — The GardensSorted team

**CUST-VISIT-REMINDER-SMS**

> GardensSorted reminder: garden visit on {visitDate:dd MMM} in {postcode}. We'll arrive in your chosen window.

---

### 1.3 Multi-property (landlord) enquiries

| ID | Channel | Trigger | Timing | Status |
|----|---------|---------|--------|--------|
| `PORT-ENQ-ACK-EMAIL` | Email | `POST /api/portfolios/enquiries` | Immediate | ✅ Live |
| `PORT-ENQ-OPS-EMAIL` | Email | Same → `App:OpsNotificationEmail` | Immediate | ✅ Live |

**PORT-ENQ-ACK-EMAIL**

- **Subject:** We received your multi-property enquiry
- **Body:**
  > Hi {contactName},
  >
  > Thanks for your enquiry. We've received your property details and will review them shortly.
  >
  > We'll be in touch with a personalised indicative quote — subject to review before any agreement is confirmed.
  >
  > — The GardensSorted team

**PORT-ENQ-OPS-EMAIL**

- **Subject:** New multi-property enquiry
- **Body:**
  > New multi-property enquiry from {contactName} ({email}, {phone}) — {propertyCount} properties.
  >
  > Review in admin → Multi-Property Solutions.

---

## 2. Marketing communications (planned)

Month 1 relies on **manual follow-up** for signup abandoners (admin **Incomplete signups** list). Automate after funnel is stable.

### 2.1 Acquisition & conversion

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `MKT-ABANDON-1-EMAIL` | Email | Signup lead captured, not converted | +1 hour | P1 | ⬜ Planned |
| `MKT-ABANDON-2-EMAIL` | Email | Still not converted | +24 hours | P1 | ⬜ Planned |
| `MKT-ABANDON-3-EMAIL` | Email | Still not converted | +72 hours | P2 | ⬜ Planned |
| `MKT-CHECKOUT-ABANDON-EMAIL` | Email | Account created, `PendingPayment` | +2 hours | P1 | ⬜ Planned |
| `MKT-WAITLIST-EMAIL` | Email | Postcode not in service area | Immediate | P2 | ⬜ Planned (needs waitlist feature) |

**MKT-ABANDON-1-EMAIL**

- **Subject:** Finish setting up your garden care plan
- **Body:**
  > Hi {firstName},
  >
  > You started signing up for GardensSorted but didn't finish — no problem.
  >
  > {if selectedPlanName}You chose **{selectedPlanName}** for a **{gardenSize}** garden.{/if}
  >
  > Pick up where you left off — it takes about 2 minutes:
  >
  > {signupLink}
  >
  > Regular lawn, borders, and tidy on a schedule. Vetted local gardeners in {cityArea}.
  >
  > — The GardensSorted team

**MKT-ABANDON-2-EMAIL**

- **Subject:** Still thinking about garden maintenance?
- **Body:**
  > Hi {firstName},
  >
  > Garden care shouldn't mean chasing gardeners. With GardensSorted you subscribe once and we handle the schedule.
  >
  > {if selectedPlanName}Your **{selectedPlanName}** quote is waiting.{/if}
  >
  > Continue signup: {signupLink}
  >
  > Questions? Reply to this email — we're happy to help.
  >
  > — The GardensSorted team

**MKT-ABANDON-3-EMAIL**

- **Subject:** Last reminder — your GardensSorted quote
- **Body:**
  > Hi {firstName},
  >
  > This is a final nudge — your signup is still open if you'd like regular garden maintenance without the hassle.
  >
  > {signupLink}
  >
  > If you've gone another way, no worries. We won't email again about this.
  >
  > — The GardensSorted team

**MKT-CHECKOUT-ABANDON-EMAIL**

- **Subject:** Complete your GardensSorted subscription
- **Body:**
  > Hi {firstName},
  >
  > Your account is set up and your **{planName}** plan is ready — we just need payment to activate your first visits.
  >
  > Complete checkout: {checkoutLink}
  >
  > Your garden details and availability are saved. First visit within 14 days of activation.
  >
  > — The GardensSorted team

**MKT-WAITLIST-EMAIL**

- **Subject:** We're not in {postcode} yet — you're on the list
- **Body:**
  > Hi {firstName},
  >
  > Thanks for your interest. We don't cover **{postcode}** yet, but we've added you to our waitlist and will email you when we launch in your area.
  >
  > — The GardensSorted team

---

### 2.2 Retention, upsell & win-back

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `MKT-ANNUAL-NUDGE-EMAIL` | Email | Monthly billing, month 2 | Day 60 of subscription | P2 | ⬜ Planned |
| `MKT-REVIEW-ASK-EMAIL` | Email | First visit completed | +24 hours | P1 (month 1) | ⬜ Planned — manual GBP review ask for now |
| `MKT-REFERRAL-EMAIL` | Email | 2nd paid month completed | Once | P3 | ⬜ Planned (after 50+ customers) |
| `MKT-SEASONAL-EMAIL` | Email | Seasonal campaign | Autumn / spring | P3 | ⬜ Planned |
| `MKT-WINBACK-EMAIL` | Email | Subscription cancelled | +14 days | P3 | ⬜ Planned |

**MKT-ANNUAL-NUDGE-EMAIL**

- **Subject:** Save ~2 months with annual billing
- **Body:**
  > Hi {firstName},
  >
  > You've been with us for two months — hope the garden's looking good.
  >
  > Switch to **annual billing** and save roughly two months compared to paying monthly. Same visits, same gardener, less admin.
  >
  > Switch in your portal: {portalBillingLink}
  >
  > — The GardensSorted team

**MKT-REVIEW-ASK-EMAIL**

- **Subject:** How was your first visit?
- **Body:**
  > Hi {firstName},
  >
  > Your first GardensSorted visit is done — we'd love to know how it went.
  >
  > If you're happy, a quick Google review helps other homeowners find us:
  >
  > {googleReviewLink}
  >
  > If anything wasn't right, reply here and we'll sort it.
  >
  > — The GardensSorted team

**MKT-REFERRAL-EMAIL**

- **Subject:** Give a neighbour £25 off — get £25 credit
- **Body:**
  > Hi {firstName},
  >
  > Know someone who'd like a garden that's looked after without the hassle?
  >
  > Share your link: {referralLink}
  >
  > You both get **£25 credit** after their second paid month.
  >
  > — The GardensSorted team

**MKT-SEASONAL-EMAIL** (example: autumn)

- **Subject:** Autumn garden prep — leaf clearance add-on
- **Body:**
  > Hi {firstName},
  >
  > Leaves are starting to fall. We're offering a one-off **autumn leaf clearance** add-on for existing subscribers in {cityArea}.
  >
  > Request in your portal or reply to this email for a quote.
  >
  > — The GardensSorted team

**MKT-WINBACK-EMAIL**

- **Subject:** We'd love to have you back
- **Body:**
  > Hi {firstName},
  >
  > We noticed you cancelled your GardensSorted subscription. If timing or cost was the issue, we'd like to help — we can discuss pausing instead of cancelling, or adjusting your plan.
  >
  > Reply to this email or chat with us in the portal.
  >
  > — The GardensSorted team

---

### 2.3 B2B / landlord outbound (manual)

| ID | Channel | Trigger | Timing | Status |
|----|---------|---------|--------|--------|
| `MKT-LANDLORD-OUTBOUND-EMAIL` | Email | Sales outreach to letting agents | Manual | ⬜ Template only |
| `MKT-LANDLORD-FOLLOWUP-EMAIL` | Email | No response to outbound | +7 days | ⬜ Template only |

**MKT-LANDLORD-OUTBOUND-EMAIL**

- **Subject:** Garden care for your rental portfolio in {city}
- **Body:**
  > Hi {contactName},
  >
  > I manage operations at GardensSorted — we provide scheduled garden maintenance for homeowners and landlords across {cityArea}.
  >
  > For portfolios of 2+ properties we offer one account, one invoice, and consistent visit scheduling. Indicative quotes online; agreements confirmed after review.
  >
  > Worth a 10-minute call? {calendlyLink}
  >
  > Or request a quote: {multiPropertyLink}
  >
  > — {senderName}, GardensSorted

---

### 2.4 Marketing SMS (planned)

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `MKT-ABANDON-SMS` | SMS | Signup abandon, phone captured | +24h | P2 | ⬜ Planned |
| `MKT-REVIEW-ASK-SMS` | SMS | First visit completed | +48h | P2 | ⬜ Planned |

**MKT-ABANDON-SMS**

> GardensSorted: you started signing up for regular garden care. Finish in 2 mins: {shortLink}

**MKT-REVIEW-ASK-SMS**

> GardensSorted: hope your first visit went well! A quick Google review helps us: {shortLink}

---

## 3. Operations communications (planned)

Transactional messages triggered by service events. Several have **workflow logs** today but **no customer notification**.

### 3.1 Visit lifecycle (gaps)

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `OPS-VISIT-SCHEDULED-EMAIL` | Email | Visits generated, not yet claimed | When first batch created | P1 | ⬜ Planned |
| `OPS-VISIT-COMPLETE-EMAIL` | Email | Provider marks visit complete | Immediate | P1 | ⬜ Planned |
| `OPS-VISIT-COMPLETE-SMS` | SMS | Same | Immediate | P2 | ⬜ Planned |
| `OPS-VISIT-CANCEL-EMAIL` | Email | Customer/admin cancels visit | Immediate | P1 | ⬜ Planned |
| `OPS-VISIT-RESCHEDULE-EMAIL` | Email | Visit rescheduled | Immediate | P1 | ⬜ Planned |
| `OPS-VISIT-RESCHEDULE-SMS` | SMS | Same | Immediate | P2 | ⬜ Planned |
| `OPS-VISIT-WEATHER-EMAIL` | Email | Weather disruption reschedule | When rescheduled | P2 | ⬜ Planned |
| `OPS-VISIT-NO-PROVIDER-EMAIL` | Email | Visit unclaimed near date | 7 days before, still open | P1 | ⬜ Planned |

**OPS-VISIT-SCHEDULED-EMAIL**

- **Subject:** Your upcoming GardensSorted visits
- **Body:**
  > Hi {firstName},
  >
  > We've scheduled your next visits:
  >
  > {visitList}
  >
  > We'll confirm each date once a gardener is assigned. View or reschedule in your portal: {portalLink}
  >
  > — The GardensSorted team

**OPS-VISIT-COMPLETE-EMAIL**

- **Subject:** Your garden visit is complete
- **Body:**
  > Hi {firstName},
  >
  > Your gardener has finished today's visit at **{postcode}**.
  >
  > Your next visit is scheduled for **{nextVisitDate}** (subject to confirmation).
  >
  > View your visit history: {portalLink}
  >
  > — The GardensSorted team

**OPS-VISIT-COMPLETE-SMS**

> GardensSorted: today's visit at {postcode} is complete. Next visit: {nextVisitDate:dd MMM}.

**OPS-VISIT-CANCEL-EMAIL**

- **Subject:** Visit cancelled — {visitDate:dddd d MMMM}
- **Body:**
  > Hi {firstName},
  >
  > Your garden visit on **{visitDate:dddd d MMMM}** at **{postcode}** has been cancelled.
  >
  > {if rescheduled}It has been rescheduled to **{newDate}**.{/if}
  >
  > Manage visits: {portalLink}
  >
  > — The GardensSorted team

**OPS-VISIT-RESCHEDULE-EMAIL**

- **Subject:** Visit rescheduled to {newDate:dddd d MMMM}
- **Body:**
  > Hi {firstName},
  >
  > Your garden visit has moved from **{oldDate}** to **{newDate}** at **{postcode}**.
  >
  > Window: **{availabilityWindow}**
  >
  > — The GardensSorted team

**OPS-VISIT-RESCHEDULE-SMS**

> GardensSorted: visit moved to {newDate:dd MMM} in {postcode}. Window: {availabilityWindow}.

**OPS-VISIT-WEATHER-EMAIL**

- **Subject:** Visit rescheduled due to weather
- **Body:**
  > Hi {firstName},
  >
  > Due to weather conditions, we've rescheduled your visit from **{oldDate}** to **{newDate}**.
  >
  > We apologise for any inconvenience. Your gardener will arrive during **{availabilityWindow}**.
  >
  > — The GardensSorted team

**OPS-VISIT-NO-PROVIDER-EMAIL**

- **Subject:** We're assigning your gardener
- **Body:**
  > Hi {firstName},
  >
  > Your visit on **{visitDate}** is coming up and we're finalising gardener assignment. No action needed — we'll confirm shortly or be in touch if we need to adjust the date.
  >
  > — The GardensSorted team

---

### 3.2 Billing & subscription

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `OPS-PAYMENT-FAILED-EMAIL` | Email | Stripe `invoice.payment_failed` | Immediate | P1 | ⬜ Planned (webhook logs only today) |
| `OPS-PAYMENT-FAILED-SMS` | SMS | Same | Immediate | P2 | ⬜ Planned |
| `OPS-PAYMENT-RETRY-EMAIL` | Email | Stripe retry attempt | Before retry | P2 | ⬜ Planned |
| `OPS-RENEWAL-EMAIL` | Email | Stripe `invoice.paid` renewal | Immediate | P3 | ⬜ Planned |
| `OPS-CANCEL-CONFIRM-EMAIL` | Email | Subscription cancellation scheduled | Immediate | P1 | ⬜ Planned (API returns message only) |
| `OPS-CANCEL-CONFIRM-SMS` | SMS | Same | Immediate | P2 | ⬜ Planned |
| `OPS-UPGRADE-CONFIRM-EMAIL` | Email | Plan upgrade (e.g. Essential → Premium) | Immediate | P2 | ⬜ Planned |
| `OPS-ANNUAL-SWITCH-EMAIL` | Email | Switched to annual billing | Immediate | P2 | ⬜ Planned |

**OPS-PAYMENT-FAILED-EMAIL**

- **Subject:** Action needed: payment failed
- **Body:**
  > Hi {firstName},
  >
  > We couldn't process your latest GardensSorted payment. Please update your payment method to keep your subscription active:
  >
  > {billingPortalLink}
  >
  > If you need help, reply to this email or use support chat in your portal.
  >
  > — The GardensSorted team

**OPS-PAYMENT-FAILED-SMS**

> GardensSorted: payment failed. Update your card to keep your subscription: {shortLink}

**OPS-PAYMENT-RETRY-EMAIL**

- **Subject:** We'll retry your payment tomorrow
- **Body:**
  > Hi {firstName},
  >
  > Your payment didn't go through. We'll try again automatically. Update your card now to avoid interruption:
  >
  > {billingPortalLink}
  >
  > — The GardensSorted team

**OPS-RENEWAL-EMAIL**

- **Subject:** Payment received — thank you
- **Body:**
  > Hi {firstName},
  >
  > We've received your **£{amount}** payment for **{planName}**. Your subscription is active through **{periodEnd}**.
  >
  > View billing history: {portalLink}
  >
  > — The GardensSorted team

**OPS-CANCEL-CONFIRM-EMAIL**

- **Subject:** Subscription cancellation confirmed
- **Body:**
  > Hi {firstName},
  >
  > Your GardensSorted subscription will end on **{cancelsAtDate}**.
  >
  > Visits scheduled after that date will be cancelled. If you change your mind before then, contact us via support chat.
  >
  > — The GardensSorted team

**OPS-CANCEL-CONFIRM-SMS**

> GardensSorted: subscription ends {cancelsAtDate:dd MMM}. Contact us if you'd like to stay.

**OPS-UPGRADE-CONFIRM-EMAIL**

- **Subject:** You're now on {newPlanName}
- **Body:**
  > Hi {firstName},
  >
  > Your plan has been upgraded to **{newPlanName}**. Your visit schedule will update accordingly — view details in your portal.
  >
  > — The GardensSorted team

**OPS-ANNUAL-SWITCH-EMAIL**

- **Subject:** You're now on annual billing
- **Body:**
  > Hi {firstName},
  >
  > You're switched to **annual billing** for **{planName}**. Your next renewal is **{renewalDate}**.
  >
  > — The GardensSorted team

---

### 3.3 Support & escalations

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `OPS-ESCALATION-ACK-EMAIL` | Email | AI/chat escalation opened | Immediate | P2 | ⬜ Planned |
| `OPS-ESCALATION-RESOLVED-EMAIL` | Email | Escalation closed | Immediate | P2 | ⬜ Planned |

**OPS-ESCALATION-ACK-EMAIL**

- **Subject:** We've received your request
- **Body:**
  > Hi {firstName},
  >
  > Thanks for getting in touch. Your request (**{escalationSummary}**) has been passed to our team. We'll respond within **{slaHours} hours**.
  >
  > — The GardensSorted team

**OPS-ESCALATION-RESOLVED-EMAIL**

- **Subject:** Your request has been resolved
- **Body:**
  > Hi {firstName},
  >
  > We've closed your support request: **{resolutionSummary}**
  >
  > If anything still isn't right, reply to this email.
  >
  > — The GardensSorted team

---

## 4. Provider communications

Primary channel per master spec: **WhatsApp** (not built). Email/SMS listed for portal parity.

| ID | Channel | Trigger | Timing | Priority | Status |
|----|---------|---------|--------|----------|--------|
| `PROV-APPLY-ACK-EMAIL` | Email | Provider self-signup | Immediate | P1 | ⬜ Planned |
| `PROV-APPROVED-EMAIL` | Email | Admin approves provider | Immediate | P1 | ⬜ Planned |
| `PROV-DISPATCH-EMAIL` | Email | Visit open for claim | Immediate | P2 | ⬜ Planned |
| `PROV-DISPATCH-SMS` | SMS | Same | Immediate | P1 | ⬜ Planned |
| `PROV-DISPATCH-WA` | WhatsApp | Same | Immediate | P1 | ⬜ Planned |
| `PROV-VISIT-REMINDER-SMS` | SMS | Day before claimed visit | ~24h before | P1 | ⬜ Planned |
| `PROV-VISIT-CANCEL-SMS` | SMS | Customer cancelled visit | Immediate | P1 | ⬜ Planned |
| `PROV-PAYOUT-EMAIL` | Email | Earnings marked paid | When admin marks paid | P2 | ⬜ Planned |

**PROV-APPLY-ACK-EMAIL**

- **Subject:** Application received — GardensSorted
- **Body:**
  > Hi {firstName},
  >
  > Thanks for applying to join GardensSorted as a gardener. We're reviewing your application and will email you once approved.
  >
  > — The GardensSorted team

**PROV-APPROVED-EMAIL**

- **Subject:** You're approved — start claiming visits
- **Body:**
  > Hi {firstName},
  >
  > You're approved on GardensSorted. Sign in to view available visits in your area:
  >
  > {providerPortalLink}
  >
  > — The GardensSorted team

**PROV-DISPATCH-SMS**

> GardensSorted: new visit available {visitDate:dd MMM} in {outcode}. Claim in app: {shortLink}

**PROV-DISPATCH-WA**

> 🌿 *New visit available*
> 📅 {visitDate:dddd d MMM}
> 📍 {outcode} ({distanceMiles} mi)
> ⏰ {availabilityWindow}
> Claim: {providerPortalLink}

**PROV-VISIT-REMINDER-SMS**

> GardensSorted reminder: visit tomorrow {visitDate:dd MMM} in {outcode}. {availabilityWindow}.

**PROV-VISIT-CANCEL-SMS**

> GardensSorted: visit on {visitDate:dd MMM} in {outcode} was cancelled.

**PROV-PAYOUT-EMAIL**

- **Subject:** Payment sent — £{amount}
- **Body:**
  > Hi {firstName},
  >
  > We've marked **£{amount}** as paid for visits through **{periodEnd}**.
  >
  > {if notes}{notes}{/if}
  >
  > View earnings: {providerPortalLink}
  >
  > — The GardensSorted team

---

## 5. Internal / ops alerts

| ID | Channel | Trigger | Recipient | Status |
|----|---------|---------|-----------|--------|
| `INT-PORT-ENQ-EMAIL` | Email | Multi-property enquiry | Ops inbox | ✅ Live |
| `INT-SIGNUP-LEAD-DIGEST-EMAIL` | Email | New signup leads (unconverted) | Ops inbox | ⬜ Planned — admin UI today |
| `INT-PAYMENT-FAILED-EMAIL` | Email | `invoice.payment_failed` | Ops inbox | ⬜ Planned |
| `INT-VISIT-UNCLAIMED-EMAIL` | Email | Visit unclaimed 5 days before | Ops inbox | ⬜ Planned |
| `INT-PROV-APPLY-EMAIL` | Email | New provider application | Ops inbox | ⬜ Planned |
| `INT-ESCALATION-EMAIL` | Email | New escalation | Ops inbox | ⬜ Planned |

**INT-SIGNUP-LEAD-DIGEST-EMAIL** (optional daily)

- **Subject:** {count} incomplete signups — follow up
- **Body:** Table of leads with email, last step, plan, postcode, captured at.

**INT-VISIT-UNCLAIMED-EMAIL**

- **Subject:** Unclaimed visit in 5 days — {postcode}
- **Body:** Visit {visitId} on {date} for {customerName} — no provider claimed. Assign manually in admin.

---

## 6. Recommended send schedule (customer journey)

```
Signup lead captured
  → MKT-ABANDON-1 (+1h) → MKT-ABANDON-2 (+24h) → MKT-ABANDON-3 (+72h)

Register account
  → CUST-WELCOME (immediate)
  → MKT-CHECKOUT-ABANDON (+2h if still PendingPayment)

Payment success
  → CUST-SUB-CONFIRM (immediate)
  → OPS-VISIT-SCHEDULED (when visits generated)

Provider claims visit
  → CUST-VISIT-CLAIMED (immediate)

~24h before visit
  → CUST-VISIT-REMINDER

Visit completed
  → OPS-VISIT-COMPLETE (immediate)
  → MKT-REVIEW-ASK (+24h) — critical for month 1 GBP reviews

Month 2 monthly billing
  → MKT-ANNUAL-NUDGE (day 60)

Payment failed
  → OPS-PAYMENT-FAILED (immediate)
  → OPS-PAYMENT-RETRY (before Stripe retry)

Cancellation
  → OPS-CANCEL-CONFIRM (immediate)
  → MKT-WINBACK (+14d)
```

---

## 7. Month 1 minimum (launch checklist)

Must-have before paid acquisition:

| # | Message | Channel | Notes |
|---|---------|---------|-------|
| 1 | CUST-WELCOME | Email | ✅ Live |
| 2 | CUST-SUB-CONFIRM | Email | ✅ Live |
| 3 | CUST-VISIT-CLAIMED | Email + SMS | ✅ Live |
| 4 | CUST-VISIT-REMINDER | Email + SMS | ✅ Live |
| 5 | MKT-REVIEW-ASK | Email | Manual OK week 1; automate by week 2 |
| 6 | MKT-ABANDON-1 | Email | Manual from admin list OK week 1 |
| 7 | OPS-VISIT-COMPLETE | Email | Not built — high priority |
| 8 | OPS-PAYMENT-FAILED | Email | Not built — high priority |
| 9 | Collect phone at signup | UI change | Unlocks SMS for all ops messages |

Nice-to-have for month 1:

- MKT-CHECKOUT-ABANDON (accounts exist without payment)
- PROV-DISPATCH-SMS (provider claim speed)
- INT-VISIT-UNCLAIMED (fulfilment SLA)

---

## 8. Implementation notes

| Topic | Recommendation |
|-------|----------------|
| **Marketing automation** | Start with SendGrid Marketing Campaigns or Loops for abandon sequences; segment on `SignupLeads` + `MarketingOptIn` |
| **Phone collection** | Add optional phone to signup step 0 or 2 — unlocks SMS for reminders and abandon |
| **Templates** | Move from plain-text `SendAsync` to SendGrid dynamic templates with brand HTML |
| **Idempotency** | Track sent message IDs on visits/subscriptions to prevent duplicate reminders |
| **Provider WhatsApp** | Twilio WhatsApp Business API or manual broadcast until provider app exists |
| **Variables** | Standard placeholders: `{firstName}`, `{postcode}`, `{visitDate}`, `{availabilityWindow}`, `{portalLink}`, `{planName}` |

---

## 9. Message count summary

| | Email | SMS |
|--|-------|-----|
| **Live (all wired)** | 39 | 16 |
| **Scheduled (background job)** | abandon ×3, checkout abandon, review ask, annual nudge, win-back | abandon, review ask |
| **Provider dispatch** | on visit open | on visit open |

*Implementation: `CommunicationService`, `ScheduledCommunicationService`, `CommunicationTemplates`. Configure `Communications:GoogleReviewUrl` and `App:OpsNotificationEmail` for production.*
