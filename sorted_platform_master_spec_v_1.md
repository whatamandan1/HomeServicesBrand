# Sorted Platform - Master Product & Technical Specification (V1)

## 1. Platform Vision

Sorted is a multi-brand home services platform designed around:
- subscription-based recurring services
- AI-assisted operations
- managed marketplace workforce distribution
- centralized customer relationship ownership
- scalable multi-brand architecture

The first launch brand will be:
- GardensSorted

Future brands may include:
- CleaningSorted
- RepairsSorted
- WindowsSorted
- other home service verticals

The long-term vision is for customers to have:
- one Sorted account
- one payment relationship
- one property profile
- access to multiple services/brands

The core backend platform must remain:
- brand agnostic
- service agnostic
- operationally centralized

---

# 2. Business Model

## Commercial Model

Sorted acts as:
- lead generation platform
- workflow orchestration platform
- managed marketplace operator
- subscription management provider
- customer relationship owner

Sorted does NOT directly perform services.
Providers are:
- self-employed contractors
- assigned or claim jobs
- paid by Sorted
- managed operationally through the platform

## Revenue Model

Primary revenue:
- recurring customer subscriptions

Future revenue opportunities:
- provider tools/services
- upsells/cross-sells
- one-off services
- premium subscription tiers
- annual plans

## Initial Geography

Launch region:
- Yorkshire, UK

Expansion must be supported later.

---

# 3. Core Product Principles

## Key Principles

### 1. Low Friction Customer Signup
Customer onboarding must be:
- fast
- simple
- mobile friendly
- conversion optimized

Initial signup should require minimal information.
Additional information can be collected later.

### 2. Subscription First
The platform is optimized primarily around recurring services.
One-off jobs may be introduced later.

### 3. AI-Assisted Operations
AI agents should eventually handle:
- customer support
- workflow orchestration
- communication drafting
- scheduling recommendations
- provider coordination
- churn prevention
- anomaly detection

Human admins act primarily as:
- orchestrators
- escalation handlers
- exception managers

### 4. Centralized Customer Ownership
Customers primarily communicate through Sorted.
Direct provider/customer communication should be minimized.

### 5. Operational Simplicity First
The MVP should prioritize:
- operational efficiency
- provider liquidity
- recurring revenue
- low admin overhead

---

# 4. User Types

## Customer
Customers can:
- browse services
- subscribe
- manage billing
- manage subscriptions
- communicate with support
- upload property photos
- view visits
- manage preferences

Customers should eventually:
- access all brands from one account
- receive cross-sell offers

## Provider
Providers are self-employed contractors.

Providers can:
- onboard to platform
- join locality groups
- claim work
- manage availability
- view earnings
- view assigned recurring customers
- communicate with operations

Providers initially communicate primarily through:
- WhatsApp

Minimal provider dashboard initially.

## Internal Admin
Internal staff can:
- manage operations
- oversee workflows
- intervene in escalations
- monitor AI actions
- manage providers
- manage subscriptions
- manage customers
- monitor KPIs

---

# 5. Service Model

## Initial Service
GardensSorted will initially focus on:
- recurring gardening subscriptions

Likely services include:
- lawn mowing
- hedge trimming
- general maintenance
- seasonal tidy-ups

Detailed service catalog to be defined later.

## Scheduling Model
Customers select:
- availability windows
NOT exact appointment times.

Higher subscription tiers may allow:
- tighter scheduling windows
- preferred visit times

Recurring services should ideally remain with the same provider.

## Weather Considerations
The platform must support:
- weather-aware scheduling
- rescheduling workflows
- weather disruption communications

---

# 6. Subscription Model

## Initial Subscription Structure
Recurring subscriptions only for MVP.

Future support:
- one-off jobs
- minimum spend requirements

## Subscription Terms
### Monthly Plans
- minimum 3-month commitment
- monthly billing

### Annual Plans
- discounted pricing
- fixed 12-month commitment

## Customer Cancellation
Customers must contact support to cancel.

No self-service cancellation in MVP.

---

# 7. Provider Marketplace Model

## Claiming Logic
Provider job assignment initially uses:
- first come first served

Constraints:
- no double booking
- travel time validation
- territory validation
- locality optimization

## Locality Model
Providers grouped by:
- local geographic areas

Initial communication/distribution may use:
- locality-based WhatsApp groups

The platform database remains the source of truth.

## Provider Performance
Providers are rated internally.

Metrics may include:
- reliability
- punctuality
- completion quality
- customer satisfaction
- claim response speed

---

# 8. Customer Experience Flow

## Signup Flow
Initial signup should capture:
- name
- email
- phone
- address
- postcode
- rough garden size
- subscription tier
- payment method
- availability preference

Optional enrichment later:
- photos/videos
- access instructions
- pets
- gate codes
- special notes

## Payment Flow
Customers pay:
- at signup

Future support:
- retries
- dunning workflows
- failed payment handling

---

# 9. Technology Strategy

## Architecture Style
Recommended architecture:
- modular monolith

Avoid microservices initially.

Reasoning:
- lower complexity
- lower infrastructure cost
- faster development
- easier AI-assisted generation
- simpler deployments

## Core Backend Stack
### Backend
- .NET 9
- ASP.NET Core Web API
- EF Core

### Frontend
- Next.js
- React
- Tailwind

### Mobile
Initial approach:
- responsive web app

Future:
- mobile app wrapper or native app

## Database Strategy
Development:
- SQLite supported

Production initial options:
- PostgreSQL
- SQL Server Express

Schema design should remain:
- SQL Server compatible

## Hosting Strategy
Initial low-cost hosting preferred.

Potential providers:
- Hetzner
- DigitalOcean
- Railway

Avoid deep Azure dependency initially.

Azure migration readiness should be maintained.

---

# 10. Recommended Future Azure Migration Path

Future scalable architecture may include:

## Database
- Azure SQL

## Hosting
- Azure App Services
- Azure Container Apps

## Messaging
- Azure Service Bus

## File Storage
- Azure Blob Storage

## Analytics
- Synapse
- Microsoft Fabric

## Secrets
- Azure Key Vault

---

# 11. Core Platform Modules

## Identity Module
Responsibilities:
- authentication
- authorization
- customer login
- provider login
- admin login
- multi-brand identity

## Brands Module
Responsibilities:
- brand configuration
- themes
- domains
- brand-specific content

## Customers Module
Responsibilities:
- customer profiles
- property details
- preferences
- support history

## Providers Module
Responsibilities:
- onboarding
- territories
- skills
- availability
- ratings
- payouts

## Services Module
Responsibilities:
- service catalog
- pricing rules
- subscription rules

## Subscription Module
Responsibilities:
- recurring billing
- plan management
- renewals
- commitment tracking

## Scheduling Module
Responsibilities:
- recurring visits
- availability windows
- weather adjustments
- provider allocation

## Dispatch Module
Responsibilities:
- provider claiming
- territory matching
- dispatch workflows
- assignment validation

## CRM Module
Responsibilities:
- operational dashboard
- customer support
- provider management
- escalations

## Communications Module
Responsibilities:
- email
- SMS
- WhatsApp integrations
- notifications
- communication logs

## AI Orchestration Module
Responsibilities:
- AI support assistant
- workflow recommendations
- AI escalation routing
- automation approvals

## Billing Module
Responsibilities:
- customer payments
- invoices
- provider payouts
- accounting exports

## Analytics Module
Responsibilities:
- recurring revenue
- churn
- provider utilization
- operational metrics

## Workflow Engine Module
Responsibilities:
- state transitions
- automation triggers
- operational orchestration
- event handling

---

# 12. Database Design Direction

## Key Principles

Database must support:
- multi-brand architecture
- future scalability
- operational auditability
- AI workflow analysis
- recurring scheduling
- provider assignment history

## Likely Core Entities

### Platform Entities
- Users
- Roles
- Permissions
- Brands

### Customer Entities
- Customers
- CustomerProperties
- CustomerPreferences
- CustomerSubscriptions

### Service Entities
- Services
- ServiceCategories
- SubscriptionPlans
- PricingRules

### Operations Entities
- Jobs
- JobVisits
- VisitSchedules
- DispatchOffers
- WorkflowEvents

### Provider Entities
- Providers
- ProviderTerritories
- ProviderSkills
- ProviderAvailability
- ProviderRatings

### Communication Entities
- Messages
- Notifications
- CommunicationThreads

### Financial Entities
- Payments
- Invoices
- ProviderPayouts
- Refunds

### AI Entities
- AIInteractions
- AIRecommendations
- AIActionLogs
- Escalations

### Audit Entities
- AuditLogs
- EntityHistory
- WorkflowStateTransitions

---

# 13. Workflow Engine Requirements

The workflow engine is a core platform component.

Example workflows:
- customer signup
- payment success
- subscription creation
- recurring visit generation
- provider dispatch
- provider claim
- customer notifications
- reminder sequences
- weather disruption handling
- completion confirmation
- payout generation
- churn prevention sequences

All workflow transitions should be logged.

---

# 14. AI Support Strategy

## Initial AI Support
Customer-facing AI support should exist from day one.

Initial AI responsibilities:
- FAQ responses
- account assistance
- schedule information
- escalation triage
- subscription guidance

## Human Escalation
AI should escalate:
- disputes
- cancellations
- edge cases
- provider complaints
- billing issues

## AI Governance
System should support:
- confidence scoring
- audit logging
- approval workflows
- human overrides

---

# 15. Communications Strategy

## Customer Communication Channels
- website live chat
- email
- SMS

## Provider Communication Channels
Primarily:
- WhatsApp

Future:
- provider portal notifications
- mobile app notifications

## Communication Logging
All communications should be centrally logged.

---

# 16. Operational KPIs

Primary early KPIs:
- recurring revenue
- churn
- provider utilization
- claim speed
- completion rate
- customer retention
- locality profitability

---

# 17. Future Features

## Future Customer Features
- cross-brand services
- referrals
- self-service upgrades
- one-off services
- loyalty/rewards

## Future Provider Features
- route planning
- earnings forecasting
- advanced scheduling
- mobile app
- performance insights

## Future Platform Features
- AI dispatch optimization
- predictive churn modeling
- automated territory balancing
- dynamic pricing
- AI scheduling optimization

---

# 18. MVP Priorities

## MUST HAVE
- customer signup
- subscription billing
- provider onboarding
- provider job claiming
- operational CRM
- recurring scheduling
- customer support chat
- payment processing
- communications logging

## SHOULD HAVE
- AI support assistant
- provider dashboard
- weather-aware workflows
- internal analytics

## LATER PHASES
- native mobile apps
- advanced AI orchestration
- route optimization
- cross-brand recommendations
- one-off jobs
- advanced analytics
- predictive automation

---

# 19. Open Decisions / To Define

The following still require detailed specification:

- exact subscription tiers
- pricing model
- garden sizing logic
- provider payout formulas
- SLA definitions
- communication tone/branding
- exact AI stack
- payment provider
- dispatch prioritization rules
- weather rescheduling rules
- referral mechanics
- provider contracts
- legal/compliance requirements
- accounting integrations
- VAT handling
- customer notification timings
- territory definitions

