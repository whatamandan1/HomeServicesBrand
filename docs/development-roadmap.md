# Development Roadmap

Living checklist comparing the current GardensSorted / Sorted platform build against
[`sorted_cursor_ai_technical_spec_v_1.md`](../planning/sorted_cursor_ai_technical_spec_v_1.md).

Use this document to track what is done, what is partial, and what to build next. Update
statuses as features ship.

**Last reviewed:** 2026-06-02 (CRM dispatch board, GDPR export/delete, Sentry, forecast script)  
**Live site:** https://gardenssorted.co.uk/ (canonical; `gardenssorted.com` redirects here)  
**Live API:** https://homeservicesbrand-production.up.railway.app/

**Product truth docs:** [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md) (pricing/cadence), [`communications-inventory.md`](communications-inventory.md) (email/SMS registry), [`signup-needs-map.md`](signup-needs-map.md) (signup + leads)

**Current focus:** Demo phase - custom domain live; growth/compliance polish shipped; Multi-Property Solutions phase 2 next.

### What's next (demo phase)

1. **Multi-Property Solutions phase 2** - pricing rules + AI indicative quote + admin review
2. **Multi-brand frontend** - when a second brand is ready
3. **Pre-launch gate** - real admin, disable demo seed - only when inviting paying customers
4. **Doc hygiene** - keep deploy/marketing/Stripe docs aligned with [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md) ✅ (2026-06-02)

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
| **Pre-launch gate** | Real admin, `Features__SeedDemoData=false` - only when inviting paying customers (custom domain ✅) |

### Plan visit cadence & pricing (product truth)

See [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md) for full detail.

| Dimension | Launch model |
|-----------|--------------|
| **Garden bands** | ≤50 m² £59.99/mo · ≤100 m² £79.99/mo · ≤150 m² £99.99/mo |
| **Visit frequency at signup** | **10 / 20 / 30 visits per year** (Essential / Premium / Elite plan names) |
| **Schedule spacing** | ~36 / ~18 / ~12 day intervals (`PlanCatalog.VisitIntervalDays`) |
| **Provider pay per visit** | **£20 / £30 / £40** by garden band (`ProviderVisitPay`) |
| **Signup add-ons** | Hedges, seasonal tidy, patio refresh (optional; 6-month min on monthly) |

Legacy demo DB rows may still have old weekly spacing or pre-band pricing from before `ecdf9ea`; new signups use garden-band pricing + yearly cadence.

**Note:** In-portal tier upgrades are disabled (`PlanCatalog.GetUpgradeTier` → `null`) until multi-tier upsell returns; AI chat copy should not promise instant upgrades.

### Last job before go-live (customer + portfolio launch gate) 🔵 Deferred

Do this **once**, immediately before inviting real paying customers (not needed during demo):

1. **Create a real admin account** (your email, strong password) - do not rely on `admin@gardenssorted.local` / seeded demo users.
2. **Turn off demo seed on Railway** - set `Features__SeedDemoData=false` and redeploy API (only after the real admin exists and you have verified admin login).
3. **Verify Stripe price IDs** match garden-band + tier uplifts - see [`stripe-price-ids-checklist.md`](stripe-price-ids-checklist.md).
4. **Smoke-test on live** - admin login, customer signup (all visit frequencies + add-ons), multi-property enquiry, billing portal, provider claim + vetting flow, no demo credentials visible in UI.

Recent session (2026-06-02): repo cleanup (`planning/` folder); roadmap aligned to garden-band product truth. Prior session (2026-05-31 → 2026-06-01): provider vetting + ID photo upload; full comms stack; signup leads + abandon automation; Leeds/York/Wakefield SEO pages; UK address autocomplete; cookie consent; garden-band pricing across signup/marketing.

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
| Customer signup | ✅ Done | 3-step wizard at `/signup`; garden band + 10/20/30 visits/yr + add-ons; dev Stripe bypass; see [`signup-needs-map.md`](signup-needs-map.md) |
| Recurring subscriptions | ✅ Done | Stripe Checkout subscription mode + renewal webhooks |
| Payment processing | ✅ Done | Renewals, past_due, cancellation via webhooks |
| Provider onboarding | ✅ Done | Self-signup at `/providers#apply` + admin approval; base postcode + radius; vetting (ID photo, RTW, DBS, insurance) |
| Provider job claiming | ✅ Done | Radius/outcode coverage + distance fallback; claim with conflict check |
| Operational CRM | 🟡 Partial | Dispatch board (status tab counts, date filter, release/assign, customer link), admin property edit, provider visit roster, workflow log refresh + payload detail; travel distance on provider claim |
| Recurring scheduling | ✅ Done | Yearly cadence via `PlanCatalog` (10/20/30 visits/yr); background top-up; legacy demo DB spacing may remain |
| Communication systems | ✅ Done | SendGrid live (transactional + lifecycle); Twilio wired but **deferred** (UK sender registration); see [`communications-inventory.md`](communications-inventory.md) |
| AI support assistant | ✅ Done | Customer portal chat + guest homepage chat |
| Signup lead capture | ✅ Done | Debounced capture + abandon/checkout/winback emails; admin **Incomplete signups** inbox |
| Multi-Property Solutions (phase 1) | ✅ Done | `/multi-property-solutions` + enquiry + admin section |

---

## Recommended build order

Work through phases in order. Each phase builds on the last.

### Phase 1 - Make the pilot production-real ✅

- [x] **PostgreSQL + EF Core migrations** - `Database.Migrate()` on startup; see `docs/database-migrations.md`
- [x] **True recurring Stripe billing** - subscription Checkout + invoice/subscription webhooks
- [x] **Visit lifecycle (provider)** - `POST .../start` and `POST .../complete`; provider UI for Claimed → InProgress → Completed
- [x] **Visit lifecycle (admin/customer)** - cancel/reschedule APIs and UI on `/portal` and `/admin`
- [x] **Escalation resolve workflow** - admin take case (InProgress) and resolve with optional notes
- [x] **Provider self-signup UI** - registration on `/providers#apply` linked to admin approval
- [x] **Provider coverage (location + radius)** - base postcode + mile radius; postcodes.io geocoding; derived outcode list; partial overlap included; background sync on signup

### Phase 2 - Day-to-day operations ✅

- [x] **Background jobs** - ongoing visit generation, dispatch offer expiry, pre-visit reminders, scheduled lifecycle comms (abandon, winback, review ask)
- [x] **SMS + email in production** - SendGrid configured for full transactional + lifecycle set; Twilio deferred (UK regulatory)
- [x] **Admin workflow viewer** - browse `WorkflowEvent` log in admin UI
- [x] **Admin AI log viewer** - browse `AIActionLog` and communication threads
- [x] **Customer property management** - edit property details, access notes, optional media upload *(media deferred)*
- [x] **Wire admin dispatch action** - expose `POST /api/admin/scheduling/open-dispatch` in admin UI
- [x] **Map views (admin + provider)** - list/map toggle for visits and provider coverage (OpenStreetMap + Leaflet)

### Phase 3 - Platform maturity (post-pilot / optional pre-launch)

- [x] **Provider availability (v1)** - working days + default hours + blocked dates on `/provider`; claim, open jobs, and preferred-provider auto-assign respect schedule; blocking a day or changing working days releases assigned visits back to open pool (incl. rescheduled)
- [x] **Provider availability (v2)** - customer text windows (morning/afternoon/evening) matched to provider work hours on open jobs, claim, auto-assign, and day-off release
- [ ] **Multi-brand frontend** - theme/config per brand; remove hardcoded `gardens-sorted` in `lib/api.ts`, `PortfolioEnquiryForm.tsx`
- [x] **Provider earnings / payouts (v1)** - visit ledger accrues on complete (`ProviderVisitPay`: £20/30/40 by garden band); provider + admin views; admin marks paid manually
- [ ] **Provider earnings / payouts (v2)** - Stripe Connect automated transfers 🔵 Deferred (demo phase)
- [x] **Recurring provider preference** - preferred provider after first visit; auto-assign pending visits on complete + scheduling
- [ ] **Weather-aware rescheduling** - weather API + reschedule workflow
- [x] **Automated test suite** - xUnit core + API tests; CI fails on test failure
- [x] **Auth hardening (core)** - role-based middleware route guards, password reset, session handling *(refresh tokens still open)*
- [x] **Production security (core)** - startup checks for JWT/webhook/Stripe bypass; Stripe signature verification; dev endpoints gated *(demo seed still on until go-live gate)*
- [ ] **In-portal tier upgrades** - checkout/API paths exist; `GetUpgradeTier` disabled until multi-tier upsell relaunch
- [ ] **Garden size help when unsure** - see [Possible later improvements](#possible-later-improvements) (AI from photos + optional Maps/aerial)

### Phase 3b - Growth & compliance ✅

- [x] **Signup lead capture** - debounced `POST /api/marketing/signup-leads`; admin **Incomplete signups** inbox
- [x] **Abandon / lifecycle email automation** - `ScheduledCommunicationService` (checkout abandon, winback, review ask, annual nudge, unclaimed visits)
- [x] **Provider vetting** - ID photo upload, RTW, DBS, insurance; admin verify + approval gate ([`provider-requirements.md`](provider-requirements.md))
- [x] **Provider add-on equipment** - checklist for hedge/seasonal/patio add-ons
- [x] **Admin impersonation** - “Act as user” for support/debug
- [x] **SEO area pages** - `/areas/[city]` (Leeds, York, Wakefield)
- [x] **UK address autocomplete** - getAddress.io on signup finish step
- [x] **Cookie policy + consent** - `/cookies`, preference UI for marketing tags
- [x] **Marketing analytics** - GA4 conversion events; visitor location for hero personalisation
- [x] **Garden size aerial suggestion** - satellite + OpenAI at signup step 3 when `GoogleMaps__ApiKey` configured; customer confirms band

### Phase 4 - Multi-Property Solutions

Requirements: [`multi-property-solutions-requirements.md`](multi-property-solutions-requirements.md)

- [x] **Multi-Property Solutions phase 1** - `/multi-property-solutions` marketing page; enquiry form (min 2 properties, address + garden size per property); admin lead inbox; ships at consumer go-live
- [ ] **Multi-Property Solutions phase 2** - pricing calculator rules; separate signup journey; AI indicative quote (immediate, pending admin review); per-property visit requirements
- [ ] **Multi-Property Solutions phase 3** - multi-property account + portal (dashboard, per-property visits, bulk import); out-of-area waitlist / find-a-gardener ops flow
- [ ] **Multi-Property Solutions phase 4** - monthly invoicing in arrears; card if &lt; £200/mo, BACS if ≥ £200/mo; per-property 3-month commitment billing; multi-property terms

### Pre-launch gate (do last) 🔵 Deferred until demo ends

- [ ] **Real admin account** - production admin user with your credentials (not demo seed)
- [ ] **Disable demo seed** - `Features__SeedDemoData=false` on Railway after real admin verified
- [ ] **Hide demo logins** - do not set `NEXT_PUBLIC_SHOW_DEMO_LOGIN` on Vercel (hidden by default; only enable locally)

---

## Customer requirements (spec §83–91)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Register / login | ✅ Done | - |
| Manage subscriptions | ✅ Done | View status & minimum term; cancel via support chat (admin processes) |
| Manage billing | ✅ Done | Stripe portal for payment method + PDF invoices; payment history in portal |
| Manage properties | 🟡 Partial | Edit property, access notes, multiple properties |
| View upcoming visits | ✅ Done | Cancel/reschedule in customer portal |
| Communicate with support | ✅ Done | Guest + authenticated AI chat |
| Upload property media | ✅ Done | Up to 3 photos per property in signup + portal (stored in DB); AI sizing not yet |

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
| Own equipment | ✅ Documented | Mower, edger/strimmer, hose or watering can, rake, brush - [`provider-requirements.md`](provider-requirements.md) |
| ID, RTW, DBS | ✅ Portal form | Post-signup `PUT /api/provider/me/vetting`; admin verify + approve gate - [`provider-requirements.md`](provider-requirements.md) |
| Claim jobs | ✅ Done | Matched by derived outcodes / distance within radius |
| Manage availability | ✅ Done | Provider self-service + admin edit; v2 time-window matching on dispatch |
| View earnings | 🟡 Partial | Accrued/paid ledger on `/provider`; garden-band per-visit pay (£20/30/40); admin mark paid; Stripe Connect 🔵 deferred |
| View recurring assignments | ✅ Done | Preferred gardener auto-assign; portal shows assigned gardener name |
| Communicate with operations | ⬜ Not started | Provider messaging or ops notifications |

---

## Admin / CRM requirements (spec §188–197)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Operational dashboards | 🟡 Partial | KPIs, trends, date filters |
| Provider management | 🟡 Partial | Approve providers; vetting verify; edit coverage + availability; earnings mark-paid |
| Customer management | 🟡 Partial | Customer detail with subs (preferred times, gardener), visit gardener names, photo lightbox |
| Multi-property management | 🟡 Partial | Multi-Property Solutions section - enquiry leads + status; quotes/invoicing phase 2+ |
| Workflow monitoring | 🟡 Partial | UI for `WorkflowEvent` log on `/admin` |
| Dispatch visibility | 🟡 Partial | Dispatch board + open-dispatch; admin release to pool + manual assign gardener |
| Escalation handling | ✅ Done | Take case and resolve in admin portal |
| KPI monitoring | ✅ Done | Dashboard counts + 7/30/90-day trend charts (weekly buckets at 90d) |
| AI action monitoring | ✅ Done | Admin view of `AIActionLog` + communication thread review |

---

## Scheduling & dispatch (spec §156–169)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Recurring visits | ✅ Done | `PlanCatalog`: 10/20/30 visits/yr; top-up job maintains buffer; initial batch on signup; legacy demo spacing may remain |
| Availability windows | ✅ Done | Customer free-text preference; provider schedule + work hours enforced on dispatch; day-off unassigns conflicting visits |
| Provider allocation | ✅ Done | Radius from base postcode; outcodes derived via postcodes.io; distance fallback |
| Weather-aware adjustments | ⬜ Not started | Weather API + reschedule workflow |
| Recurring provider preference | ✅ Done | Set on first completed visit; auto-assign on scheduling + after complete |
| FCFS claiming | ✅ Done | - |
| Double-booking prevention | ✅ Done | Conflict check on claim |
| Travel-time validation | 🟡 Partial | Straight-line distance shown on provider open jobs; claim requires verified coords + coverage check |
| Dispatch offer expiry | ✅ Done | `ExpireStaleDispatchOffersAsync` in background job; renews open offers |

---

## Communications (spec §171–177)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Live chat | ✅ Done | Guest homepage + customer portal |
| Email notifications | ✅ Done | SendGrid live; full transactional + lifecycle set - see [`communications-inventory.md`](communications-inventory.md) |
| SMS notifications | 🔵 Deferred | Twilio wired; blocked on UK sender registration - demo uses email |
| WhatsApp provider workflows | ⬜ Not started | - |
| Centralized communication logs | ✅ Done | DB persistence + admin communication thread viewer on `/admin` |

---

## Workflow engine (spec §201–216)

| Workflow | Status | Next step |
|----------|--------|-----------|
| Customer signup | ✅ Done | Logged via `WorkflowEvent` |
| Payment success | ✅ Done | Initial payment + recurring renewals via webhooks |
| Recurring visit generation | ✅ Done | Yearly cadence (10/20/30 visits/yr); top-up maintains ~4 future visits |
| Provider dispatch | 🟡 Partial | Offer expiry job + preferred-provider auto-assign |
| Provider claim | ✅ Done | Email always; SMS when Twilio configured |
| Reminders | ✅ Done | Pre-visit email in background job; SMS when Twilio configured |
| Weather rescheduling | ⬜ Not started | - |
| Payout generation | 🟡 Partial | Garden-band per-visit accrual on visit complete; admin marks paid manually; Stripe Connect 🔵 deferred |
| Portfolio quote | ⬜ Not started | AI indicative + admin review (phase 2) |
| Portfolio invoicing | ⬜ Not started | Monthly arrears; card/BACS threshold (phase 4) |
| Churn prevention | ⬜ Not started | - |

All workflow transitions should be logged - logging exists; automation and admin visibility are the gaps.

---

## Core modules (spec §114–133)

Modular boundaries to maintain as the platform grows.

| Module | Status | Notes |
|--------|--------|-------|
| Identity | ✅ Done | JWT, BCrypt, roles (Customer, Provider, Admin, Landlord) |
| Brands | 🟡 Partial | Entity + API; frontend not multi-brand yet |
| Customers | ✅ Done | Registration, portal, subscriptions |
| Multi-Property Solutions | 🟡 Partial | Phase 1 enquiry + admin leads; invoicing track phase 4 |
| Providers | 🟡 Partial | Self-signup, coverage, claiming, availability v1+v2, vetting + ID photo, earnings ledger v1 |
| Services | ✅ Done | Garden care by band + optional add-ons; 10/20/30 visits/yr at signup |
| Subscriptions | ✅ Done | Plans + Stripe subscription Checkout + renewal webhooks |
| Scheduling | ✅ Done | `PlanCatalog` yearly cadence; top-up jobs; provider availability + time windows enforced |
| Dispatch | 🟡 Partial | FCFS claim + preferred auto-assign; travel validation missing |
| CRM | 🟡 Partial | Customer/provider detail, vetting, photo lightbox, earnings, availability edit, trends, signup leads |
| Communications | ✅ Done | Full transactional + lifecycle email; chat done; SMS deferred; admin thread viewer |
| Billing | ✅ Done | Stripe subscription Checkout (consumer); portfolio invoicing ⬜ phase 4 |
| AI Orchestration | ✅ Done | OpenAI chat, escalation, audit logging |
| Workflow Engine | 🟡 Partial | Event logging; limited automation |
| Analytics | 🔵 Deferred | Basic admin counts only |

---

## Architecture & platform (spec §24–63, §259–272)

| Area | Status | Next step |
|------|--------|-----------|
| .NET backend (spec: .NET 9) | ✅ Done | Repo uses .NET 10 - acceptable |
| Clean architecture / modular monolith | ✅ Done | Core, Infrastructure, Api layers |
| Next.js + Tailwind frontend | ✅ Done | Marketing site + app portals |
| SQLite local dev | ✅ Done | - |
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
| JWT + RBAC | ✅ Done | API + Next.js role middleware on `/admin`, `/provider`, `/portal`, `/landlord` |
| Encrypted secrets | 🟡 Partial | Env vars documented; production startup validates JWT + Stripe webhook |
| GDPR readiness | 🟡 Partial | Privacy policy at `/privacy`; admin export/delete on customer detail (on written request) |
| Audit logging | ✅ Done | AI + workflow + communication logs in DB; admin viewers on `/admin` |
| Structured logging | 🟡 Partial | Serilog + `/health`; **Sentry optional** via `Sentry__Dsn` (API) and `NEXT_PUBLIC_SENTRY_DSN` (web) |
| Workflow tracing | ✅ Done | `WorkflowEvent` table + admin workflow viewer |
| AI action logging | ✅ Done | `AIActionLog` persisted |
| Automated tests | ✅ Done | xUnit core + API integration tests; Playwright e2e in CI |
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

## Possible later improvements

Ideas worth revisiting after core signup and scheduling are stable - not committed to a phase yet.

| Item | Notes |
|------|--------|
| **AI garden size from photos** | When a customer is unsure which band (Small / Medium / Large) fits, analyse optional signup or property photos with a vision model to estimate **maintained** lawn and bed area and suggest a band (human can override). Reuse existing photo upload flow; show confidence and “we’ll confirm on first visit” disclaimer. |
| **Google Maps / aerial garden size** | 🟡 Partial — satellite + OpenAI at signup when `GoogleMaps__ApiKey` and `OpenAI__ApiKey` set; customer confirms band on step 3 |

Related today: garden size is self-selected on step 0; **aerial suggestion** runs on step 3 after address entry when Maps + OpenAI are configured; customer confirms before payment ([`signup-needs-map.md`](signup-needs-map.md)).

---

## What's already shipped (reference)

Quick snapshot of implemented features as of **2026-06-02**.

### Backend
- Auth: register/login, JWT, password reset, role-based controllers, admin impersonation
- Customer: signup creates account, property, subscription; garden-band pricing + visit frequency + add-ons; property edit in portal
- Stripe: subscription Checkout + renewal/past_due/cancel webhooks; billing portal (cancel disabled - support/admin only); customer payment history API
- Visits: scheduling service, background jobs (top-up, dispatch expiry, reminders), claim/start/complete, cancel/reschedule
- Provider earnings: `ProviderEarning` ledger; garden-band per-visit accrual on complete (£20/30/40); admin mark paid
- Plan cadence: `PlanCatalog` - 10/20/30 visits/yr (~36/18/12 day intervals); scheduling + payouts aligned
- Provider availability: working days, hours, blocked dates; **v2** customer time-window matching (morning/afternoon/evening); day-off releases assigned visits; admin can edit provider schedule
- Provider vetting: ID photo upload, RTW, DBS, insurance; admin verify + approval gate
- Signup leads: capture API, abandon/checkout/winback automation via `ScheduledCommunicationService`
- Admin CRM: photo lightbox, customer preferred times/gardener, provider earnings + availability + vetting edit, signup lead inbox
- Billing: Manage billing for active subs; Stripe link recovery from checkout session
- Admin: KPI trend charts (daily 7/30d, weekly 90d); workflow/AI/comms thread viewers; maps
- AI: customer + guest chat, escalation creation, audit logs
- Comms: full transactional + lifecycle email set ([`communications-inventory.md`](communications-inventory.md)); Twilio wired (SMS deferred)
- Multi-property: enquiry API + admin leads; demo landlord portal (`/landlord`) seeded separately from MPS product track
- Brands API, workflow event logging, health checks

### Frontend
- Marketing: customer-focused `/`, `/about`, `/providers`; **For landlords** `/multi-property-solutions`; SEO area pages (`/areas/leeds`, etc.); sitemap, robots; hero with visitor location; lazy chat; `/privacy`, `/terms`, `/cookies`; OG + Facebook assets
- Custom domain: `gardenssorted.co.uk` + `gardenssorted.com` (redirect to `.co.uk`; see `docs/custom-domain-setup.md`)
- Operational polish: shared loading spinners, alert banners, admin mobile section nav, dashboard skeleton
- Signup: 3-step wizard (garden band, visit frequency 10/20/30/yr, add-ons); UK address autocomplete; lead capture hook; provider apply form (postcode + radius slider)
- Portals: `/portal` (Manage billing, photos, preferred gardener), `/provider` (coverage, availability, earnings, vetting), `/admin` (CRM + trends + leads + comms), `/landlord` (multi-property demo dashboard)
- Mobile UX: responsive layouts, hamburger nav, mobile CTA bar
- API proxy via Next.js rewrites for Vercel production

### Infrastructure
- Railway + Vercel deployment docs
- GitHub Actions CI: backend build + tests, frontend build, Playwright e2e
- Docker, env examples, Stripe/Twilio setup guides

### Since last review (2026-05-26 → 2026-06-02)

- Garden-band pricing + 10/20/30 visits/yr across signup and marketing
- Full email/SMS comms stack + lifecycle automation
- Provider vetting + ID photo upload
- Signup leads + abandon sequences; admin incomplete signups inbox
- Leeds/York/Wakefield SEO pages + GA4
- UK address autocomplete; cookie consent + legal pages
- Repo cleanup: `planning/` folder, removed debug assets

---

## How to update this document

When shipping a feature:

1. Change the relevant row status (⬜ → 🟡 → ✅).
2. Check off completed items in the phase checklist.
3. Update **Last reviewed** at the top.
4. Add a one-line note under **What's already shipped** if useful.

When scoping a sprint, start from **What's next** at the top; run the **Pre-launch gate** only when ready for real customers.
