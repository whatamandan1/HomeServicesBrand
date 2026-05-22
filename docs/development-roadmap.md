# Development Roadmap

Living checklist comparing the current GardensSorted / Sorted platform build against
[`sorted_cursor_ai_technical_spec_v_1.md`](../sorted_cursor_ai_technical_spec_v_1.md).

Use this document to track what is done, what is partial, and what to build next. Update
statuses as features ship.

**Last reviewed:** 2026-05-22  
**Live site:** https://home-services-brand.vercel.app/

**Current focus:** Phase 1 — production-real pilot (migrations done; recurring Stripe billing done; next: visit lifecycle).

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
| Provider onboarding | 🟡 Partial | API exists (`POST /api/auth/register/provider`); no frontend signup |
| Provider job claiming | ✅ Done | Territory-filtered open visits + claim with conflict check |
| Operational CRM | 🟡 Partial | Admin dashboard, lists, provider approval; escalation resolve missing |
| Recurring scheduling | 🟡 Partial | Generates initial batch of 4 weekly visits only |
| Communication systems | 🟡 Partial | Email/SMS services wired; often no-op without config |
| AI support assistant | ✅ Done | Customer portal chat + guest homepage chat |

---

## Recommended build order

Work through phases in order. Each phase builds on the last.

### Phase 1 — Make the pilot production-real

- [x] **PostgreSQL + EF Core migrations** — `Database.Migrate()` on startup; see `docs/database-migrations.md`
- [x] **True recurring Stripe billing** — subscription Checkout + invoice/subscription webhooks
- [ ] **Visit lifecycle completion** — APIs/UI for `InProgress` → `Completed` (and `Cancelled` / `Rescheduled`)
- [ ] **Escalation resolve workflow** — admin assign/resolve; use `EscalationStatus.InProgress` / `Resolved`
- [ ] **Provider self-signup UI** — registration flow on `/providers` linked to admin approval

### Phase 2 — Day-to-day operations

- [ ] **Background jobs** — ongoing visit generation, dispatch offer expiry, pre-visit reminders
- [ ] **SMS + email in production** — configure Twilio and SendGrid; visit/subscription notifications
- [ ] **Admin workflow viewer** — browse `WorkflowEvent` log in admin UI
- [ ] **Admin AI log viewer** — browse `AIActionLog` and communication threads
- [ ] **Customer property management** — edit property details, access notes, optional media upload
- [ ] **Wire admin dispatch action** — expose `POST /api/admin/scheduling/open-dispatch` in admin UI

### Phase 3 — Platform maturity

- [ ] **Multi-brand frontend** — theme/config per brand; remove hardcoded `gardens-sorted` in API client
- [ ] **Provider availability** — calendar or availability windows
- [ ] **Provider earnings / payouts** — ledger or Stripe Connect integration
- [ ] **Recurring provider preference** — assign same gardener where possible
- [ ] **Weather-aware rescheduling** — weather API + reschedule workflow
- [ ] **Automated test suite** — unit + integration tests; CI fails on test failure
- [ ] **Auth hardening** — Next.js middleware route guards, password reset, refresh tokens
- [ ] **Production security** — enforce Stripe webhook signatures; hide demo logins (`NEXT_PUBLIC_SHOW_DEMO_LOGIN`)

---

## Customer requirements (spec §83–91)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Register / login | ✅ Done | — |
| Manage subscriptions | 🟡 Partial | Cancel, upgrade/downgrade, minimum-term enforcement |
| Manage billing | 🟡 Partial | Billing portal, payment method updates, invoice history |
| Manage properties | 🟡 Partial | Edit property, access notes, multiple properties |
| View upcoming visits | ✅ Done | Add reschedule/cancel when visit lifecycle is built |
| Communicate with support | ✅ Done | Guest + authenticated AI chat |
| Upload property media | ⬜ Not started | Photo upload during signup and in portal |

---

## Provider requirements (spec §93–100)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Onboard | 🟡 Partial | Self-serve signup page + admin approval UX |
| Claim jobs | ✅ Done | — |
| Manage availability | ⬜ Not started | Availability calendar / time windows |
| View earnings | ⬜ Not started | Payout ledger + Stripe Connect or manual tracking |
| View recurring assignments | 🟡 Partial | Show assigned recurring visits; add preference logic |
| Communicate with operations | ⬜ Not started | Provider messaging or ops notifications |

---

## Admin / CRM requirements (spec §188–197)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Operational dashboards | 🟡 Partial | KPIs, trends, date filters |
| Customer management | 🟡 Partial | Edit customer, cancel subscription, view comms history |
| Provider management | 🟡 Partial | Full CRUD, territory editing, suspend provider |
| Workflow monitoring | 🟡 Partial | UI for `WorkflowEvent` log |
| Dispatch visibility | 🟡 Partial | Dispatch board + open-dispatch action in UI |
| Escalation handling | 🟡 Partial | Assign, resolve, status updates |
| KPI monitoring | 🟡 Partial | Dashboard counts only; no trends or exports |
| AI action monitoring | 🟡 Partial | Admin view of `AIActionLog` + thread review |

---

## Scheduling & dispatch (spec §156–169)

| Requirement | Status | Next step |
|-------------|--------|-----------|
| Recurring visits | 🟡 Partial | Background job to generate future visits indefinitely |
| Availability windows | ⬜ Not started | Customer + provider time preferences |
| Provider allocation | 🟡 Partial | Postcode territory matching only |
| Weather-aware adjustments | ⬜ Not started | Weather API + reschedule workflow |
| Recurring provider preference | ⬜ Not started | "Same gardener" assignment logic |
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
| Payment success | ✅ Done | Extend for recurring renewals |
| Recurring visit generation | 🟡 Partial | Automate beyond initial 4-visit batch |
| Provider dispatch | 🟡 Partial | Offer expiry + prioritization |
| Provider claim | ✅ Done | SMS notification when configured |
| Reminders | ⬜ Not started | Pre-visit email/SMS |
| Weather rescheduling | ⬜ Not started | — |
| Payout generation | ⬜ Not started | — |
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
| Providers | 🟡 Partial | Claiming works; onboarding UI and availability missing |
| Services | 🟡 Partial | Garden care only; subscription plans seeded |
| Subscriptions | 🟡 Partial | Plans + activation; not true recurring billing |
| Scheduling | 🟡 Partial | Initial visit batch; no ongoing generation |
| Dispatch | 🟡 Partial | FCFS claim; offer expiry and travel validation missing |
| CRM | 🟡 Partial | Admin read views; escalation resolve missing |
| Communications | 🟡 Partial | Chat done; email/SMS/WhatsApp incomplete |
| Billing | 🟡 Partial | Stripe Checkout one-time; renewals/retries missing |
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
| JWT + RBAC | ✅ Done (API) | Add Next.js middleware / server route guards |
| Encrypted secrets | 🟡 Partial | Env vars documented; enforce in all environments |
| GDPR readiness | ⬜ Not started | Privacy flows, data export/delete |
| Audit logging | 🟡 Partial | AI + workflow logs in DB; admin UI missing |
| Structured logging | 🟡 Partial | Serilog + `/health`; add error tracking (e.g. Sentry) |
| Workflow tracing | 🟡 Partial | `WorkflowEvent` table; no admin viewer |
| AI action logging | ✅ Done | `AIActionLog` persisted |
| Automated tests | ⬜ Not started | Zero test projects; CI uses `continue-on-error` |
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
- Auth: register/login, JWT, role-based controllers
- Customer: signup creates account, property, subscription
- Stripe: checkout session + webhook activation
- Visits: scheduling service, open-for-claim, provider claim
- Admin: dashboard, customers, providers, visits, escalations (read-only)
- AI: customer + guest chat, escalation creation, audit logs
- SMS/email: Twilio + SendGrid services (no-op when unconfigured)
- Brands API, workflow event logging, health checks

### Frontend
- Marketing: `/`, `/about`, `/providers`, pricing, FAQ, guest live chat
- Signup: 3-step wizard with plan picker
- Portals: `/portal`, `/provider`, `/admin`
- Mobile UX: responsive layouts, hamburger nav, mobile CTA bar
- API proxy via Next.js rewrites for Vercel production

### Infrastructure
- Railway + Vercel deployment docs
- GitHub Actions CI (build only)
- Docker, env examples, Stripe/Twilio setup guides

---

## How to update this document

When shipping a feature:

1. Change the relevant row status (⬜ → 🟡 → ✅).
2. Check off completed items in the phase checklist.
3. Update **Last reviewed** at the top.
4. Add a one-line note under **What's already shipped** if useful.

When scoping a sprint, start from **Phase 1** unchecked items unless production blockers say otherwise.
