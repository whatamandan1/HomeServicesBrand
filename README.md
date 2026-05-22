# Sorted Platform (GardensSorted MVP)

Modular monolith backend (.NET 10) + Next.js frontend for the Sorted home services platform.

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download) (or .NET 9 SDK + 9.0 runtime)
- Node.js 20+ and npm
- (Optional) [Stripe CLI](https://stripe.com/docs/stripe-cli) for local webhooks

## Quick start (local)

### 1. Backend

```bash
cd src/backend
dotnet restore
cp Sorted.Api/appsettings.Development.local.json.example Sorted.Api/appsettings.Development.local.json
# Edit local json with Stripe, SendGrid, OpenAI keys (or leave empty for dev fallbacks)

# Recommended (avoids hanging on "Building...")
./scripts/dev-api.sh

# Or manually:
dotnet build src/backend/Sorted.Api
dotnet run --project src/backend/Sorted.Api --no-build --urls http://localhost:5080
```

**Stuck on `Building...`?** Stop with Ctrl+C, then:

```bash
dotnet build-server shutdown
lsof -i :5080   # if something is listening, kill that PID
dotnet build src/backend/Sorted.Api
dotnet run --project src/backend/Sorted.Api --no-build
```

API: http://localhost:5080 — Swagger: http://localhost:5080/swagger

SQLite database is created at `src/backend/Sorted.Api/sorted.db` on first run.

**Demo accounts (seeded):**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@gardenssorted.local | Admin123! |
| Provider | provider@gardenssorted.local | Provider123! |
| Customer (demo jobs) | demo@gardenssorted.local | Demo123! |

The demo provider covers postcode sectors **LS1**, **LS2**, and **WF1**. On API startup, claimable demo visits are seeded in **LS1 4AP** if none exist. Customer signups need a matching postcode (e.g. `LS1 4AP`) for jobs to appear on the provider portal.

### 2. Frontend

```bash
cd src/frontend/web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5080" > .env.local
npm run dev
```

Web: http://localhost:3000

### 3. Stripe (optional this weekend)

Without Stripe keys, signup falls back to `POST /api/dev/activate-subscription/{id}` (Development only).

With Stripe:

```bash
stripe listen --forward-to localhost:5080/api/webhooks/stripe
```

Set `Stripe:WebhookSecret` from the CLI output.

### 4. Customer flow

1. http://localhost:3000/signup — register + checkout (or dev activate)
2. http://localhost:3000/portal — subscriptions, visits, AI chat
3. Login as provider → claim open visits
4. Login as admin → CRM dashboard, approve providers

## Project structure

```
src/backend/
  Sorted.Api/           # HTTP API host
  Sorted.Core/          # Entities, DTOs, interfaces
  Sorted.Infrastructure/# EF Core, Stripe, SendGrid, OpenAI
src/frontend/web/       # Next.js (customer, provider, admin routes)
```

## Deploy staging

See **[docs/deploy-staging.md](docs/deploy-staging.md)** for Vercel (frontend) + Railway (API).

**Next:** **[docs/staging-hardening.md](docs/staging-hardening.md)** — PostgreSQL, SendGrid, OpenAI.  
**Dev costs / skip payment:** **[docs/dev-costs-and-email.md](docs/dev-costs-and-email.md)**

## GitHub Actions

CI builds backend and frontend on push/PR. See `.github/workflows/ci.yml`.

## Spec documents

- `sorted_cursor_ai_technical_spec_v_1.md`
- `sorted_platform_master_spec_v_1.md`
