# Sorted - Cursor AI Technical Build Specification

## Objective

Build a production-ready modular monolith platform for Sorted.

The platform must support:
- multi-brand home services
- recurring subscriptions (consumer)
- portfolio accounts with personalised pricing and invoicing
- customer accounts
- provider marketplace workflows
- operational CRM
- AI-assisted support
- recurring scheduling
- workflow orchestration

Initial launch brand:
- GardensSorted

Future brands must be supported without major architectural redesign.

---

# Architecture Requirements

## Backend
Use:
- .NET 9
- ASP.NET Core Web API
- Entity Framework Core
- clean architecture principles
- modular monolith structure

Avoid microservices initially.

## Frontend
Use:
- Next.js
- React
- Tailwind CSS

Frontend must support:
- multiple brands/themes/domains
- responsive design
- customer login portal
- portfolio login portal
- provider portal
- internal admin CRM

## Database
Database should support:
- SQLite for local development
- easy migration to SQL Server/PostgreSQL

Schema design must remain SQL Server compatible.

Use:
- migrations
- soft deletes where appropriate
- audit timestamps
- foreign key integrity
- normalized operational schema

---

# Core Platform Requirements

## Multi-Brand Support
The system must support:
- multiple brands
- brand-specific frontend presentation
- shared backend platform
- shared authentication
- shared customer accounts

Example:
- GardensSorted
- future brands

---

# User Types

## Customers
Customers must be able to:
- register/login
- manage subscriptions
- manage billing
- manage properties
- view upcoming visits
- communicate with support
- upload property media

## Portfolio accounts (For portfolios)
Portfolio account holders (landlords, letting agents, multi-property owners with **2+ properties**) must be able to:
- submit enquiries and (later) complete a separate signup journey with the same UX feel as consumer signup
- manage multiple properties under **one login / one portfolio** (v1)
- specify **per-property** visit requirements, garden size, and address data for quoting
- receive **personalised indicative quotes** (AI + calculation rules; subject to admin review)
- view a **portfolio dashboard** — all properties, visits, spend, and per-property detail
- **bulk import** properties via the portal (not at initial signup)
- add/remove properties with **recalculated pricing** and **per-property 3-month minimum commitment**
- pay via **monthly invoicing in arrears** (card if portfolio total **< £200/mo**, **BACS** if **≥ £200/mo**)

Portfolio accounts use **invoicing**, not consumer Stripe subscriptions. Tenants never receive platform access.

See [`docs/for-portfolios-requirements.md`](docs/for-portfolios-requirements.md) for full product rules, phases, and marketing copy.

## Providers
Providers must be able to:
- onboard
- claim jobs
- manage availability
- view earnings
- view recurring assignments
- communicate with operations

## Admins
Admins must be able to:
- manage workflows
- manage customers
- manage portfolio accounts (dedicated CRM section)
- manage providers
- monitor jobs
- manage subscriptions
- manage portfolio quotes, pricing overrides, and invoicing
- handle escalations
- monitor AI actions

---

# Core Modules To Implement

Implement modular boundaries for:

- Identity
- Brands
- Customers
- Portfolios
- Providers
- Services
- Subscriptions
- Scheduling
- Dispatch
- CRM
- Communications
- Billing
- AI Orchestration
- Workflow Engine
- Analytics

Modules should remain loosely coupled internally.

---

# Key Functional Requirements

## Customer Signup
Customer signup flow should:
- remain low friction
- support recurring subscriptions
- collect payment during signup
- collect property information
- support optional media uploads

## Subscription Management
Support:
- monthly subscriptions
- annual subscriptions
- minimum terms
- recurring billing
- renewals
- payment retries

Consumer subscriptions use Stripe Checkout / subscription webhooks. Portfolio accounts use **invoicing** (see For portfolios below).

## For portfolios (multi-property)
Support a separate **For portfolios** commercial track alongside consumer signup:

- **Audience:** private landlords, letting agents, holiday-let owners — **minimum 2 properties**
- **Pricing:** personalised rates from calculation rules (property count, postcodes/clustering, per-property visit frequency, service level, garden size, seasonality) — **not** fixed Essential/Premium tiers
- **Quoting:** indicative quote returned immediately (phase 2+ via AI + rules); **admin review required** before agreement; admin price override supported
- **Commitment:** **3 months per property**; removing a property mid-term still bills the quoted amount for that property through the commitment
- **Changes:** adding a property recalculates totals; each new property gets its **own 3-month lock-in**
- **Billing:** **monthly invoices in arrears**; card if **< £200/mo**, BACS if **≥ £200/mo**; invoice the account holder (agent or owner)
- **Coverage:** same geography as consumer at launch; out-of-area properties → waitlist or ops “find a gardener”
- **Tenants:** never platform users
- **Terms:** portfolio-specific terms where appropriate (separate from consumer T&Cs)
- **Phasing:** (1) enquiry form + marketing page at consumer go-live → (2) AI quote + signup → (3) portal + bulk import → (4) invoicing

Full requirements: [`docs/for-portfolios-requirements.md`](docs/for-portfolios-requirements.md)

## Scheduling
Support:
- recurring visits
- availability windows
- provider allocation
- weather-aware adjustments
- recurring provider preference

## Dispatch System
Support:
- locality-based provider assignment
- first-come-first-served claiming
- double-booking prevention
- travel-time validation

## Communications
Support:
- live chat
- email notifications
- SMS notifications
- WhatsApp provider workflows
- centralized communication logs

## AI Support
Implement:
- AI customer support assistant
- escalation workflows
- AI audit logging
- human override capability

---

# CRM Requirements

Internal CRM should support:
- operational dashboards
- customer management
- portfolio account management (dedicated section — leads, quotes, overrides, invoicing)
- provider management
- workflow monitoring
- dispatch visibility
- escalation handling
- KPI monitoring
- portfolio reporting (properties per account, portfolio MRR, churn)

---

# Workflow Engine Requirements

Implement workflow/event-driven orchestration.

Example workflows:
- customer signup
- portfolio enquiry
- portfolio quote (AI indicative + admin review)
- portfolio agreement activation
- monthly portfolio invoicing
- payment success
- recurring visit generation
- provider dispatch
- provider claim
- reminders
- weather rescheduling
- payout generation
- churn prevention
- portfolio property add/remove (recalc + lock-in)

All workflow transitions should be logged.

---

# Authentication Requirements

Support:
- JWT authentication
- RBAC authorization
- customer roles
- portfolio account holder roles
- provider roles
- admin roles
- shared identity across brands

---

# Non-Functional Requirements

## Performance
- scalable architecture
- efficient scheduling queries
- optimized recurring job generation

## Security
- secure authentication
- encrypted secrets
- GDPR readiness
- audit logging

## Observability
- structured logging
- error tracking
- workflow tracing
- AI action logging

## Maintainability
- modular codebase
- clean architecture
- domain-driven naming
- clear separation of concerns

---

# Deployment Requirements

Initial deployment should support:
- low-cost infrastructure
- containerization readiness
- cloud migration readiness

Potential hosting:
- Hetzner
- DigitalOcean
- Railway

Future Azure migration compatibility required.

---

# Initial MVP Priorities

Prioritize:
- customer signup
- recurring subscriptions
- payment processing
- provider onboarding
- provider claiming workflows
- operational CRM
- scheduling engine
- communication systems
- AI support assistant
- for portfolios phase 1 (enquiry) at consumer go-live

Deprioritize:
- advanced AI autonomy
- native mobile apps
- advanced analytics
- dynamic pricing (consumer plans — portfolio personalised pricing is in scope via For portfolios)
- route optimization
- referral systems

