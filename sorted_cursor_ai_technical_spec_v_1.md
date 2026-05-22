# Sorted - Cursor AI Technical Build Specification

## Objective

Build a production-ready modular monolith platform for Sorted.

The platform must support:
- multi-brand home services
- recurring subscriptions
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
- manage providers
- monitor jobs
- manage subscriptions
- handle escalations
- monitor AI actions

---

# Core Modules To Implement

Implement modular boundaries for:

- Identity
- Brands
- Customers
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
- provider management
- workflow monitoring
- dispatch visibility
- escalation handling
- KPI monitoring

---

# Workflow Engine Requirements

Implement workflow/event-driven orchestration.

Example workflows:
- customer signup
- payment success
- recurring visit generation
- provider dispatch
- provider claim
- reminders
- weather rescheduling
- payout generation
- churn prevention

All workflow transitions should be logged.

---

# Authentication Requirements

Support:
- JWT authentication
- RBAC authorization
- customer roles
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

Deprioritize:
- advanced AI autonomy
- native mobile apps
- advanced analytics
- dynamic pricing
- route optimization
- referral systems

