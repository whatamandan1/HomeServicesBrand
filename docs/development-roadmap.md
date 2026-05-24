# Development Roadmap

Living checklist comparing the current GardensSorted / Sorted platform build against
[`sorted_cursor_ai_technical_spec_v_1.md`](../sorted_cursor_ai_technical_spec_v_1.md).

Use this document to track what is done, what is partial, and what to build next. Update
statuses as features ship.

**Last reviewed:** 2026-05-23  
**Live site:** https://home-services-brand.vercel.app/  
**Live API:** https://homeservicesbrand-production.up.railway.app/

**Current focus:** Twilio SMS + pre-launch gate. Payout ledger v1 and admin CRM polish shipped.

### What's next (when you resume)

Recent batch shipped: provider earnings ledger (manual payout), admin photo thumbnails, admin provider availability view, day-off release fix.

1. **Twilio SMS** — UK sender registration + visit/reminder texts in prod
2. **Stripe Connect (v2 payouts)** — automated transfers when manual payout volume grows
3. **Pre-launch gate** (when ready) — real admin account, `Features__SeedDemoData=false`, custom domain

### Last job before go-live (customer launch gate)

Do this **once**, immediately before inviting real paying customers:

1. **Create a real admin account** (your email, strong password) — do not rely on `admin@gardenssorted.local` / seeded demo users.
2. **Turn off demo seed on Railway** — set `Features__SeedDemoData=false` and redeploy API (only after the real admin exists and you have verified admin login).
3. **Smoke-test on live** — admin login, customer signup, billing portal, provider claim flow, no demo credentials visible in UI.

Recent session (2026-05-23): provider earnings ledger (accrue on complete, admin mark paid), admin CRM photo thumbnails + provider availability read-only, day-off visit release verified on live.

---

## Status legend

| Status | Meaning |
|--------|---------|
| ✅ Done | Shipped and usable in the current MVP |
| 🟡 Partial | Started but incomplete or stubbed |
| ⬜ Not started | Required by spec, not yet built |
| 🔵 Deferred | Explicitly deprioritized in spec §296–304 |

---

## MVP priorities (spec §276–287)

These are the spec's top priorities for initial launch.

| Priority | Status | Notes / next step |
|----------|--------|-------------------|
| Customer signup | ✅ Done | 3-step wizard at `/signup`; dev Stripe bypass available |
| Recurring subscriptions | ✅ Done | Stripe Checkout subscription mode + renewal webhooks |
| Payment processing | ✅ Done | Renewals, past_due, cancellation via webhooks |
| Provider onboarding | ✅ Done | Self-signup at `/providers#apply` + admin approval; base postcode + radius |
| Provider job claiming | ✅ Done | Radius/outcode coverage + distance fallback; claim with conflict check |
| Operational CRM | 🟡 Partial | Dashboard, visits, escalations, workflow/AI viewers, customer detail, provider coverage edit |
| Recurring scheduling | 🟡 Partial | Background jobs top up visits; tune cadence if needed |
| Communication systems | 🟡 Partial | SendGrid live; Twilio deferred (UK regulatory) |
| AI support assistant | ✅ Done | Customer portal chat + guest homepage chat |

---

## Recommended build order

Work through phases in order. Each phase builds on the last.

### Phase 1 — Make the pilot production-real ✅

- [x] **PostgreSQL + EF Core migrations** — `Database.Migrate()` on startup; see `docs/database-migrations.md`
- [x] **True recurring Stripe billing** — subscription Checkout + invoice/subscription webhooks
- [x] **Visit lifecycle (provider)** — `POST .../start` and `POST .../complete`; provider UI for Claimed → InProgress → Completed
- [x] **Visit lifecycle (admin/customer)** — cancel/reschedule APIs and UI on `/portal` and `/admin`
- [x] **Escalation resolve workflow** — admin take case (InProgress) and resolve with optional notes
- [x] **Provider self-signup UI** — registration on `/providers#apply` linked to admin approval
- [x] **Provider coverage (location + radius)** — base postcode + mile radius; postcodes.io geocoding; derived outcode list; partial overlap included; background sync on signup

### Phase 2 — Day-to-day operations ✅

- [x] **Background jobs** — ongoing visit generation, dispatch offer expiry, pre-visit reminders
- [x] **SMS + email in production** — SendGrid configured; Twilio deferred (UK regulatory)
- [x] **Admin workflow viewer** — browse `WorkflowEvent` log in admin UI
- [x] **Admin AI log viewer** — browse `AIActionLog` and communication threads
- [x] **Customer property management** — edit property details, access notes, optional media upload *(media deferred)*
- [x] **Wire admin dispatch action** — expose `POST /api/admin/scheduling/open-dispatch` in admin UI
- [x] **Map views (admin + provider)** — list/map toggle for visits and provider coverage (OpenStreetMap + Leaflet)

### Phase 3 — Platform maturity (post-pilot / optional pre-launch)

- [x] **Provider availability (v1)** — working days + default hours + blocked dates on `/provider`; claim, open jobs, and preferred-provider auto-assign respect schedule; blocking a day or changing working days releases assigned visits back to open pool (incl. rescheduled)
- [ ] **Provider availability (v2)** — match visit times to customer text windows; admin view/edit
- [ ] **Multi-brand frontend** — theme/config per brand; remove hardcoded `gardens-sorted` in API client
- [x] **Provider earnings / payouts (v1)** — visit ledger accrues on complete (~60% share); provider + admin views; admin marks paid manually
- [ ] **Provider earnings / payouts (v2)** — Stripe Connect automated transfers
- [x] **Recurring provider preference** — preferred provider after first visit; auto-assign pending visits on complete + scheduling
- [ ] **Weather-aware rescheduling** — weather API + reschedule workflow
- [x] **Automated test suite** — xUnit core + API tests; CI fails on test failure
- [x] **Auth hardening (core)** — role-based middleware route guards, password reset, session handling *(refresh tokens still open)*
- [x] **Production security (core)** — startup checks for JWT/webhook/Stripe bypass; Stripe signature verification; dev endpoints gated *(demo seed still on until go-live gate)*
- [ ] **Google Maps garden size estimation** — satellite/aerial imagery to suggest or calculate garden area at signup or property edit *(deferred; requires Google Maps Platform API)*

### Pre-launch gate (do last)

- [ ] **Real admin account** — production admin user with your credentials (not demo seed)
- [ ] **Disable demo seed** — `Features__SeedDemoData=false` on Railway after real admin verified
- [ ] **Hide demo logins** — do not set `NEXT_PUBLIC_SHOW_DEMO_LOGIN` on Vercel (hidden by default; only enable locally)

---

## Customer requirements (spec §83–91)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Register / login | ✅ Done | — |
| Manage subscriptions | ✅ Done | View status & minimum term; cancel via support chat (admin processes) |
| Manage billing | ✅ Done | Stripe portal for payment method + PDF invoices; payment history in portal |
| Manage properties | 🟡 Partial | Edit property, access notes, multiple properties |
| View upcoming visits | ✅ Done | Cancel/reschedule in customer portal |
| Communicate with support | ✅ Done | Guest + authenticated AI chat |
| Upload property media | 🟡 Partial | Up to 3 photos per property in signup + portal (stored in DB) |

---

## Provider requirements (spec §93–100)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Onboard | ✅ Done | Apply at `/providers#apply` (postcode + radius); admin approves on `/admin` |
| Claim jobs | ✅ Done | Matched by derived outcodes / distance within radius |
| Manage availability | 🟡 Partial | Working days, hours, blocked dates on `/provider`; admin read-only view; v2 = time-window matching + admin edit |
| View earnings | 🟡 Partial | Accrued/paid ledger on `/provider`; admin mark paid; Stripe Connect deferred |
| View recurring assignments | ✅ Done | Preferred gardener auto-assign; portal shows assigned gardener name |
| Communicate with operations | ⬜ Not started | Provider messaging or ops notifications |

---

## Admin / CRM requirements (spec §188–197)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Operational dashboards | 🟡 Partial | KPIs, trends, date filters |
| Provider management | 🟡 Partial | Approve providers; edit coverage; read-only availability + earnings in provider detail |
| Customer management | 🟡 Partial | Customer detail with subs, visits, property photo thumbnails, support chat history; admin cancel subscription |
| Workflow monitoring | 🟡 Partial | UI for `WorkflowEvent` log |
| Dispatch visibility | 🟡 Partial | Dispatch board + open-dispatch action in UI |
| Escalation handling | ✅ Done | Take case and resolve in admin portal |
| KPI monitoring | ✅ Done | Dashboard counts + 7/30/90-day trend charts (weekly buckets at 90d) |
| AI action monitoring | 🟡 Partial | Admin view of `AIActionLog` + thread review |

---

## Scheduling & dispatch (spec §156–169)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Recurring visits | 🟡 Partial | Background job to generate future visits indefinitely |
| Availability windows | 🟡 Partial | Customer free-text preference on signup; provider schedule enforced on dispatch; day-off unassigns conflicting visits |
| Provider allocation | ✅ Done | Radius from base postcode; outcodes derived via postcodes.io; distance fallback |
| Weather-aware adjustments | ⬜ Not started | Weather API + reschedule workflow |
| Recurring provider preference | ✅ Done | Set on first completed visit; auto-assign on scheduling + after complete |
| FCFS claiming | ✅ Done | — |
| Double-booking prevention | ✅ Done | Conflict check on claim |
| Travel-time validation | ⬜ Not started | Distance/travel checks before claim |
| Dispatch offer expiry | 🟡 Partial | `ExpiresAtUtc` set; no expiry background job |

---

## Communications (spec §171–177)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Live chat | ✅ Done | Guest homepage + customer portal |
| Email notifications | 🟡 Partial | SendGrid wired; configure in prod; add reminders |
| SMS notifications | 🟡 Partial | Twilio wired; configure in prod (deferred by user) |
| WhatsApp provider workflows | ⬜ Not started | — |
| Centralized communication logs | ✅ Done | DB persistence; admin UI to browse still needed |

---

## Workflow engine (spec §201–216)

| Workflow | Status | Next step |
|----------|--------|-----------|
| Customer signup | ✅ Done | Logged via `WorkflowEvent` |
| Payment success | ✅ Done | Initial payment + recurring renewals via webhooks |
| Recurring visit generation | 🟡 Partial | Automate beyond initial 4-visit batch |
| Provider dispatch | 🟡 Partial | Offer expiry + prioritization |
| Provider claim | ✅ Done | SMS notification when configured |
| Reminders | ⬜ Not started | Pre-visit email/SMS |
| Weather rescheduling | ⬜ Not started | — |
| Payout generation | 🟡 Partial | Earning accrues on visit complete; admin marks paid manually |
| Churn prevention | ⬜ Not started | — |

All workflow transitions should be logged — logging exists; automation and admin visibility are the gaps.

---

## Core modules (spec §114–133)

Modular boundaries to maintain as the platform grows.

| Module | Status | Notes |
|--------|--------|-------|
| Identity | ✅ Done | JWT, BCrypt, roles (Customer, Provider, Admin) |
| Brands | 🟡 Partial | Entity + API; frontend not multi-brand yet |
| Customers | ✅ Done | Registration, portal, subscriptions |
| Providers | 🟡 Partial | Self-signup, coverage, claiming, availability v1, earnings ledger v1 |
| Services | 🟡 Partial | Garden care only; subscription plans seeded |
| Subscriptions | ✅ Done | Plans + Stripe subscription Checkout + renewal webhooks |
| Scheduling | 🟡 Partial | Visit batch + top-up jobs; provider availability enforced |
| Dispatch | 🟡 Partial | FCFS claim + preferred auto-assign; travel validation missing |
| CRM | 🟡 Partial | Admin read views + trends + escalation resolve |
| Communications | 🟡 Partial | Chat done; email/SMS/WhatsApp incomplete |
| Billing | ✅ Done | Stripe subscription Checkout + renewals/past_due/cancel webhooks |
| AI Orchestration | ✅ Done | OpenAI chat, escalation, audit logging |
| Workflow Engine | 🟡 Partial | Event logging; limited automation |
| Analytics | 🔵 Deferred | Basic admin counts only |

---

## Architecture & platform (spec §24–63, §259–272)

| Area | Status | Next step |
|------|--------|-----------|
| .NET backend (spec: .NET 9) | ✅ Done | Repo uses .NET 10 — acceptable |
| Clean architecture / modular monolith | ✅ Done | Core, Infrastructure, Api layers |
| Next.js + Tailwind frontend | ✅ Done | Marketing site + app portals |
| SQLite local dev | ✅ Done | — |
| PostgreSQL production | 🟡 Partial | Supported + documented; add Postgres service on Railway |
| EF Core migrations | ✅ Done | `Data/Migrations/`; auto-applied on startup |
| Multi-brand frontend | ⬜ Not started | Themes/domains per brand |
| Shared auth across brands | 🟡 Partial | Backend ready; frontend single-brand |
| Containerization | ✅ Done | `Dockerfile` present |
| Railway / Vercel deployment | ✅ Done | See `docs/deploy-staging.md` |
| Azure migration readiness | 🟡 Partial | Migrations + Postgres improve portability |

---

## Non-functional requirements (spec §232–255)

| Area | Status | Next step |
|------|--------|-----------|
| JWT + RBAC | ✅ Done | API + Next.js role middleware on `/admin`, `/provider`, `/portal` |
| Encrypted secrets | 🟡 Partial | Env vars documented; production startup validates JWT + Stripe webhook |
| GDPR readiness | 🟡 Partial | Privacy policy at `/privacy`; data export/delete flows still open |
| Audit logging | 🟡 Partial | AI + workflow logs in DB; admin UI missing |
| Structured logging | 🟡 Partial | Serilog + `/health`; add error tracking (e.g. Sentry) |
| Workflow tracing | 🟡 Partial | `WorkflowEvent` table; no admin viewer |
| AI action logging | ✅ Done | `AIActionLog` persisted |
| Automated tests | 🟡 Partial | xUnit core + API integration tests; CI fails on test failure |
| Maintainability | ✅ Done | Clear module separation, domain naming |

---

## Explicitly deprioritized (spec §296–304)

Do not build these until core MVP is production-stable.

| Item | Status |
|------|--------|
| Advanced AI autonomy | 🔵 Deferred |
| Native mobile apps | 🔵 Deferred (responsive web in place) |
| Advanced analytics | 🔵 Deferred |
| Dynamic pricing | 🔵 Deferred |
| Route optimization | 🔵 Deferred |
| Referral systems | 🔵 Deferred |

---

## What's already shipped (reference)

Quick snapshot of implemented features as of last review.

### Backend
- Auth: register/login, JWT, password reset, role-based controllers, admin impersonation
- Customer: signup creates account, property, subscription; property edit in portal
- Stripe: subscription Checkout + renewal/past_due/cancel webhooks; billing portal (cancel disabled — support/admin only); customer payment history API
- Visits: scheduling service, background jobs (top-up, dispatch expiry, reminders), claim/start/complete, cancel/reschedule
- Provider earnings: `ProviderEarning` ledger; accrues on visit complete (~60% of plan revenue per visit); `GET /api/provider/earnings`; admin mark paid
- Provider availability: `WorkingDaysMask`, default hours, `ProviderBlockedDates`; API + provider UI; enforced on open jobs, claim, auto-assign; calendar-day release of assigned visits on blocked dates / non-working days
- Admin CRM: property photo thumbnails in customer detail; provider availability + earnings in provider detail
- Signup: terms acceptance, deferred photo upload, checkout session sync, PostgreSQL migration repair
- Billing: Manage billing for active subs; Stripe link recovery from checkout session
- Admin: KPI trend charts (daily 7/30d, weekly 90d); customer photo count in CRM
- Gardener preference: auto-assign pending visits after complete; provider list auto-refresh
- Admin: dashboard, customer detail (subs, visits, chat history), provider detail, workflow/AI/comms viewers, maps
- AI: customer + guest chat, escalation creation, audit logs
- SMS/email: SendGrid live on Railway; Twilio wired (deferred)
- Brands API, workflow event logging, health checks

### Frontend
- Marketing: customer-focused `/`, `/about`, `/providers`; SEO (sitemap, robots); compressed hero; lazy chat; `/privacy` and `/terms`; OG image (~200KB JPEG)
- Signup: 3-step customer wizard; provider apply form (postcode + radius slider)
- Portals: `/portal` (Manage billing, photos, preferred gardener), `/provider` (coverage, availability, earnings), `/admin` (CRM + trends + photo thumbnails)
- Mobile UX: responsive layouts, hamburger nav, mobile CTA bar
- API proxy via Next.js rewrites for Vercel production

### Infrastructure
- Railway + Vercel deployment docs
- GitHub Actions CI (build only)
- Docker, env examples, Stripe/Twilio setup guides

### Recent commits (2026-05-23)
- *(pending)* — provider earnings ledger v1 + admin CRM polish (photos, availability, mark paid)
- `89b611b` — roadmap update after day-off release verification
- `efacb65` — reliable day-off release (calendar-day match, rescheduled visits, schedule-change + my-visits self-heal)
- `772083a` — initial day-off clash fix (blocked-date release)
- `bb9ef6d` — provider availability v1 (working days, hours, blocked dates)
- `5e14953` — 90-day weekly trend charts; provider refresh after complete
- `0555109` — billing portal, admin trends/photos, gardener auto-assign on complete
- `ae236be` — PostgreSQL migration fix (signup blocked on Railway)
- `ceb7b02` / `95b9416` — signup photo deferral + checkout recovery
- `f5f310a` — terms, property photos, admin trends, gardener preference, tests

---

## How to update this document

When shipping a feature:

1. Change the relevant row status (⬜ → 🟡 → ✅).
2. Check off completed items in the phase checklist.
3. Update **Last reviewed** at the top.
4. Add a one-line note under **What's already shipped** if useful.

When scoping a sprint, start from **What's next** at the top; run the **Pre-launch gate** only when ready for real customers.
