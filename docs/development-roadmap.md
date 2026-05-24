# Development Roadmap

Living checklist comparing the current GardensSorted / Sorted platform build against
[`sorted_cursor_ai_technical_spec_v_1.md`](../sorted_cursor_ai_technical_spec_v_1.md).

Use this document to track what is done, what is partial, and what to build next. Update
statuses as features ship.

**Last reviewed:** 2026-05-23 (Multi-Property Solutions)  
**Live site:** https://home-services-brand.vercel.app/  
**Live API:** https://homeservicesbrand-production.up.railway.app/

**Current focus:** Demo phase — Multi-Property Solutions phase 1 shipped; polish consumer pilot.

### What's next (demo phase)

1. **Operational polish** — whatever surfaces during demo testing (CRM, scheduling edge cases)
2. **Multi-Property Solutions phase 2** — pricing rules + AI indicative quote + admin review
3. **Multi-brand frontend** — when a second brand is ready

**Multi-Property Solutions** (full requirements: [`multi-property-solutions-requirements.md`](multi-property-solutions-requirements.md)):

| Phase | Scope | Target |
|-------|--------|--------|
| 1 | `/multi-property-solutions` page + enquiry (2+ properties, address + garden size) | ✅ Shipped |
| 2 | Pricing rules + AI indicative quote + admin review | Post go-live |
| 3 | Multi-property account, portal, bulk import | Post go-live |
| 4 | Monthly invoicing in arrears (card &lt; £200 / BACS ≥ £200) | Post go-live |

### Deferred until post-demo / go-live

| Item | Why deferred |
|------|----------------|
| **Twilio SMS** | UK sender registration pending; email covers demo |
| **Stripe Connect (v2 payouts)** | Manual admin mark-paid is fine for demo |
| **Pre-launch gate** | Real admin, `Features__SeedDemoData=false`, custom domain — only when inviting paying customers |

### Plan visit cadence (product truth)

| Plan | Visits included | Schedule spacing | Provider pay per visit (~60% share) |
|------|-----------------|------------------|-------------------------------------|
| Essential | 1 / month | every 30 days | ~£17.97 (at £29.95/mo) |
| Premium | 2 / month | every 15 days | ~£14.99 (at £49.95/mo) |

Legacy demo data may still have weekly-spaced visits from before `ecdf9ea`; new signups and top-ups use plan cadence.

### Last job before go-live (customer + portfolio launch gate) 🔵 Deferred

Do this **once**, immediately before inviting real paying customers (not needed during demo):

1. **Create a real admin account** (your email, strong password) — do not rely on `admin@gardenssorted.local` / seeded demo users.
2. **Turn off demo seed on Railway** — set `Features__SeedDemoData=false` and redeploy API (only after the real admin exists and you have verified admin login).
3. **Ship Multi-Property Solutions phase 1** — `/multi-property-solutions` marketing page + enquiry form (2+ properties, address + garden size); admin lead notification.
4. **Smoke-test on live** — admin login, customer signup, multi-property enquiry, billing portal, provider claim flow, no demo credentials visible in UI.

Recent session (2026-05-23): plan cadence + earnings fix (`PlanCatalog`: Essential 1 visit/mo, Premium 2/mo); provider earnings ledger; admin availability edit + photo lightbox + richer customer CRM; day-off visit release; billing/signup/trends/auto-assign from earlier in session — all verified on live.

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
| Recurring scheduling | 🟡 Partial | Plan cadence via `PlanCatalog` (Essential 30d, Premium 15d); background top-up; legacy weekly visits may remain in demo DB |
| Communication systems | 🟡 Partial | SendGrid live; Twilio deferred (UK regulatory) |
| AI support assistant | ✅ Done | Customer portal chat + guest homepage chat |
| Multi-Property Solutions (phase 1) | ✅ Done | `/multi-property-solutions` + enquiry + admin section |

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
- [x] **Provider availability (v2)** — customer text windows (morning/afternoon/evening) matched to provider work hours on open jobs, claim, auto-assign, and day-off release
- [ ] **Multi-brand frontend** — theme/config per brand; remove hardcoded `gardens-sorted` in API client
- [x] **Provider earnings / payouts (v1)** — visit ledger accrues on complete (60% share ÷ plan visits/mo); Essential ~£17.97, Premium ~£14.99; provider + admin views; admin marks paid manually
- [ ] **Provider earnings / payouts (v2)** — Stripe Connect automated transfers 🔵 Deferred (demo phase)
- [x] **Recurring provider preference** — preferred provider after first visit; auto-assign pending visits on complete + scheduling
- [ ] **Weather-aware rescheduling** — weather API + reschedule workflow
- [x] **Automated test suite** — xUnit core + API tests; CI fails on test failure
- [x] **Auth hardening (core)** — role-based middleware route guards, password reset, session handling *(refresh tokens still open)*
- [x] **Production security (core)** — startup checks for JWT/webhook/Stripe bypass; Stripe signature verification; dev endpoints gated *(demo seed still on until go-live gate)*
- [ ] **Google Maps garden size estimation** — satellite/aerial imagery to suggest or calculate garden area at signup or property edit *(deferred; requires Google Maps Platform API)*

### Phase 4 — Multi-Property Solutions

Requirements: [`multi-property-solutions-requirements.md`](multi-property-solutions-requirements.md)

- [x] **Multi-Property Solutions phase 1** — `/multi-property-solutions` marketing page; enquiry form (min 2 properties, address + garden size per property); admin lead inbox; ships at consumer go-live
- [ ] **Multi-Property Solutions phase 2** — pricing calculator rules; separate signup journey; AI indicative quote (immediate, pending admin review); per-property visit requirements
- [ ] **Multi-Property Solutions phase 3** — multi-property account + portal (dashboard, per-property visits, bulk import); out-of-area waitlist / find-a-gardener ops flow
- [ ] **Multi-Property Solutions phase 4** — monthly invoicing in arrears; card if &lt; £200/mo, BACS if ≥ £200/mo; per-property 3-month commitment billing; multi-property terms

### Pre-launch gate (do last) 🔵 Deferred until demo ends

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

## Multi-Property Solutions requirements (spec + [`multi-property-solutions-requirements.md`](multi-property-solutions-requirements.md))

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Marketing page | ✅ Done | `/multi-property-solutions` |
| Enquiry form (phase 1) | ✅ Done | 2+ properties, address + garden size; ack email + ops notify |
| Personalised pricing rules | ⬜ Not started | Calculator module; all inputs: count, clustering, frequency, service level, garden size, seasonality |
| AI indicative quote | ⬜ Not started | Immediate quote + admin review queue (phase 2) |
| Multi-property signup journey | ⬜ Not started | Separate flow, same UX feel; per-property visit requirements |
| Multi-property portal | ⬜ Not started | Dashboard, bulk import, add/remove with recalc (phase 3) |
| Invoicing (not subscription) | ⬜ Not started | Monthly arrears; card &lt; £200 / BACS ≥ £200 (phase 4) |
| Per-property 3-month commitment | ⬜ Not started | Remove mid-term still bills quoted amount |
| Admin Multi-Property Solutions section | 🟡 Partial | Enquiry leads + status; quotes/invoicing phase 2+ |
| Multi-property terms | ⬜ Not started | Separate from consumer T&Cs |
| Out-of-area handling | ⬜ Not started | Waitlist or ops find-a-gardener |

---

## Provider requirements (spec §93–100)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Onboard | ✅ Done | Apply at `/providers#apply` (postcode + radius); admin approves on `/admin` |
| Claim jobs | ✅ Done | Matched by derived outcodes / distance within radius |
| Manage availability | ✅ Done | Provider self-service + admin edit; v2 time-window matching on dispatch |
| View earnings | 🟡 Partial | Accrued/paid ledger on `/provider`; plan-based per-visit amounts; admin mark paid; Stripe Connect 🔵 deferred |
| View recurring assignments | ✅ Done | Preferred gardener auto-assign; portal shows assigned gardener name |
| Communicate with operations | ⬜ Not started | Provider messaging or ops notifications |

---

## Admin / CRM requirements (spec §188–197)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Operational dashboards | 🟡 Partial | KPIs, trends, date filters |
| Provider management | 🟡 Partial | Approve providers; edit coverage + availability; earnings mark-paid |
| Customer management | 🟡 Partial | Customer detail with subs (preferred times, gardener), visit gardener names, photo lightbox |
| Multi-property management | 🟡 Partial | Multi-Property Solutions section — enquiry leads + status; quotes/invoicing phase 2+ |
| Workflow monitoring | 🟡 Partial | UI for `WorkflowEvent` log on `/admin` |
| Dispatch visibility | 🟡 Partial | Dispatch board + open-dispatch action in UI |
| Escalation handling | ✅ Done | Take case and resolve in admin portal |
| KPI monitoring | ✅ Done | Dashboard counts + 7/30/90-day trend charts (weekly buckets at 90d) |
| AI action monitoring | 🟡 Partial | Admin view of `AIActionLog` + thread review |

---

## Scheduling & dispatch (spec §156–169)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Recurring visits | 🟡 Partial | `PlanCatalog`: Essential 1/mo, Premium 2/mo; top-up job maintains buffer; initial batch on signup |
| Availability windows | ✅ Done | Customer free-text preference; provider schedule + work hours enforced on dispatch; day-off unassigns conflicting visits |
| Provider allocation | ✅ Done | Radius from base postcode; outcodes derived via postcodes.io; distance fallback |
| Weather-aware adjustments | ⬜ Not started | Weather API + reschedule workflow |
| Recurring provider preference | ✅ Done | Set on first completed visit; auto-assign on scheduling + after complete |
| FCFS claiming | ✅ Done | — |
| Double-booking prevention | ✅ Done | Conflict check on claim |
| Travel-time validation | ⬜ Not started | Distance/travel checks before claim |
| Dispatch offer expiry | ✅ Done | `ExpireStaleDispatchOffersAsync` in background job; renews open offers |

---

## Communications (spec §171–177)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Live chat | ✅ Done | Guest homepage + customer portal |
| Email notifications | 🟡 Partial | SendGrid live; visit-claimed + pre-visit reminder emails in job loop |
| SMS notifications | 🔵 Deferred | Twilio wired; blocked on UK sender registration — demo uses email |
| WhatsApp provider workflows | ⬜ Not started | — |
| Centralized communication logs | ✅ Done | DB persistence; admin UI to browse still needed |

---

## Workflow engine (spec §201–216)

| Workflow | Status | Next step |
|----------|--------|-----------|
| Customer signup | ✅ Done | Logged via `WorkflowEvent` |
| Payment success | ✅ Done | Initial payment + recurring renewals via webhooks |
| Recurring visit generation | 🟡 Partial | Plan-based spacing (30d / 15d); top-up maintains ~4 future visits |
| Provider dispatch | 🟡 Partial | Offer expiry job + preferred-provider auto-assign |
| Provider claim | ✅ Done | Email always; SMS when Twilio configured |
| Reminders | 🟡 Partial | Pre-visit email in background job; SMS when Twilio configured |
| Weather rescheduling | ⬜ Not started | — |
| Payout generation | 🟡 Partial | Plan-based accrual on visit complete; admin marks paid manually; Stripe Connect 🔵 deferred |
| Portfolio quote | ⬜ Not started | AI indicative + admin review (phase 2) |
| Portfolio invoicing | ⬜ Not started | Monthly arrears; card/BACS threshold (phase 4) |
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
| Multi-Property Solutions | 🟡 Partial | Phase 1 enquiry + admin leads; invoicing track phase 4 |
| Providers | 🟡 Partial | Self-signup, coverage, claiming, availability v1+v2, earnings ledger v1 |
| Services | 🟡 Partial | Essential (1 visit/mo) + Premium (2 visits/mo); plan copy aligned |
| Subscriptions | ✅ Done | Plans + Stripe subscription Checkout + renewal webhooks |
| Scheduling | 🟡 Partial | `PlanCatalog` cadence; top-up jobs; provider availability + time windows enforced |
| Dispatch | 🟡 Partial | FCFS claim + preferred auto-assign; travel validation missing |
| CRM | 🟡 Partial | Customer/provider detail, photo lightbox, earnings, availability edit, trends |
| Communications | 🟡 Partial | Chat done; email/SMS/WhatsApp incomplete |
| Billing | ✅ Done | Stripe subscription Checkout (consumer); portfolio invoicing ⬜ phase 4 |
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
| PostgreSQL production | ✅ Done | Live on Railway; migrations + schema repair on startup |
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
| Workflow tracing | 🟡 Partial | `WorkflowEvent` table + admin workflow viewer |
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
| Dynamic pricing | 🔵 Deferred (consumer) | Multi-property personalised pricing in scope via Multi-Property Solutions phases 2–4 |
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
- Provider earnings: `ProviderEarning` ledger; plan-based accrual on complete (60% ÷ visits/mo — Essential ~£17.97, Premium ~£14.99); admin mark paid
- Plan cadence: `PlanCatalog.VisitsPerMonth` — Essential 1/mo (30d interval), Premium 2/mo (15d interval); scheduling + payouts aligned
- Provider availability: working days, hours, blocked dates; **v2** customer time-window matching (morning/afternoon/evening); day-off releases assigned visits; admin can edit provider schedule
- Admin CRM: photo lightbox, customer preferred times/gardener, provider earnings + availability edit
- Signup/plan copy: Essential “1 visit per month”, Premium “2 visits per month”
- Signup: terms acceptance, deferred photo upload, checkout session sync, PostgreSQL migration repair
- Billing: Manage billing for active subs; Stripe link recovery from checkout session
- Admin: KPI trend charts (daily 7/30d, weekly 90d); customer photo count in CRM
- Gardener preference: auto-assign pending visits after complete; provider list auto-refresh
- Admin: dashboard, customer detail (subs, visits, chat history), provider detail, workflow/AI/comms viewers, maps
- AI: customer + guest chat, escalation creation, audit logs
- SMS/email: SendGrid live on Railway; Twilio wired (deferred)
- Brands API, workflow event logging, health checks

### Frontend
- Marketing: customer-focused `/`, `/about`, `/providers`; **For landlords** `/multi-property-solutions`; SEO (sitemap, robots); compressed hero; lazy chat; `/privacy` and `/terms`; OG image (~200KB JPEG)
- Signup: 3-step customer wizard; provider apply form (postcode + radius slider)
- Portals: `/portal` (Manage billing, photos, preferred gardener), `/provider` (coverage, availability, earnings), `/admin` (CRM + trends + photo lightbox)
- Mobile UX: responsive layouts, hamburger nav, mobile CTA bar
- API proxy via Next.js rewrites for Vercel production

### Infrastructure
- Railway + Vercel deployment docs
- GitHub Actions CI (build only)
- Docker, env examples, Stripe/Twilio setup guides

### Recent commits (2026-05-23)
- `15c1d84` — provider availability v2 (customer time-window matching)
- `ecdf9ea` — plan visit cadence + provider pay (Essential 1/mo, Premium 2/mo)
- `7e5b4d7` — admin CRM polish (availability edit, photo lightbox, earnings refresh)
- `62069a3` — provider earnings ledger v1 + admin photo thumbnails
- `89b611b` — roadmap update after day-off release verification
- `efacb65` — reliable day-off release (calendar-day match, self-heal)
- `772083a` — initial day-off clash fix
- `bb9ef6d` — provider availability v1
- `5e14953` — 90-day weekly trend charts; provider refresh after complete
- `0555109` — billing portal, admin trends/photos, gardener auto-assign
- `ae236be` — PostgreSQL migration fix (signup on Railway)

---

## How to update this document

When shipping a feature:

1. Change the relevant row status (⬜ → 🟡 → ✅).
2. Check off completed items in the phase checklist.
3. Update **Last reviewed** at the top.
4. Add a one-line note under **What's already shipped** if useful.

When scoping a sprint, start from **What's next** at the top; run the **Pre-launch gate** only when ready for real customers.
