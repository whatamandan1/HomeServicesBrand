# Deploy staging (Vercel + Railway)

## Overview

| Component | Host | URL |
|-----------|------|-----|
| Frontend | [Vercel](https://vercel.com) | https://home-services-brand.vercel.app |
| API | [Railway](https://railway.app) | https://homeservicesbrand-production.up.railway.app |

## 1. Push code to GitHub

```bash
cd /Users/dan/Documents/HomeServicesBrand
git init
git add .
git commit -m "Sorted MVP — GardensSorted platform"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

Ensure `appsettings.Development.local.json` is **not** committed (it is gitignored).

---

## 2. Deploy API on Railway

1. New Project → **Deploy from GitHub repo**
2. Leave **Root Directory** empty (repo root). Railway reads `railway.toml` → builds `src/backend/Dockerfile`
3. If the first deploy failed, open the service → **Variables** → add the vars below → **Deploy** → **Redeploy**
4. Add **Variables** (Railway dashboard):

| Variable | Example |
|----------|---------|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `Jwt__Secret` | long random string (32+ chars) |
| `Stripe__SecretKey` | `sk_test_...` or live later |
| `Stripe__WebhookSecret` | from Stripe Dashboard webhook |
| `Stripe__Prices__EssentialMonthly` | optional — `price_...` from Stripe Dashboard |
| `Stripe__Prices__EssentialAnnual` | optional — `price_...` from Stripe Dashboard |
| `Stripe__Prices__PremiumMonthly` | optional — `price_...` for Premium £49.95/mo |
| `Stripe__Prices__PremiumAnnual` | optional — `price_...` for Premium £499.95/yr |
| `Plans__EssentialMonthly` | `29.95` — shown on site and synced to DB on startup |
| `Plans__EssentialAnnual` | `299.95` — shown on site and synced to DB on startup |
| `Plans__PremiumMonthly` | `49.95` |
| `Plans__PremiumAnnual` | `499.95` |
| `Features__BypassStripeCheckout` | `false` — must be false in production (API refuses to start if true) |
| `Stripe__SuccessUrl` | `https://YOUR-VERCEL-URL/signup/success` |
| `Stripe__CancelUrl` | `https://YOUR-VERCEL-URL/signup` |
| `SendGrid__ApiKey` | optional — see [dev-costs-and-email.md](dev-costs-and-email.md) |
| `SendGrid__FromEmail` | verified sender (must match SendGrid single sender) |
| `SendGrid__FromName` | `GardensSorted` |
| `Twilio__AccountSid` | optional — see [twilio-sms-setup.md](twilio-sms-setup.md) |
| `Twilio__AuthToken` | Twilio auth token |
| `Twilio__FromPhoneNumber` | E.164, e.g. `+447...` |
| `OpenAI__ApiKey` | optional |
| `Cors__AllowedOrigins__0` | `https://YOUR-VERCEL-URL` |
| `Cors__AllowedOrigins__1` | `http://localhost:3000` |

4. Deploy → **Generate a public URL** (see below) → production API: `https://homeservicesbrand-production.up.railway.app`

**Stripe webhook (staging):**

- Dashboard → Developers → Webhooks → Add endpoint  
- URL: `https://homeservicesbrand-production.up.railway.app/api/webhooks/stripe`  
- Events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Paste signing secret into `Stripe__WebhookSecret`

**Note:** SQLite on Railway is ephemeral (resets on redeploy). Use **PostgreSQL** for persistent staging/production — the API applies EF migrations automatically on startup.

### PostgreSQL on Railway (recommended)

1. In your Railway project → **+ New** → **Database** → **PostgreSQL**
2. Open the **API service** → **Variables** → **Add variable reference** (or link Postgres service) so Railway injects `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
3. Redeploy the API — on startup it runs `Database.Migrate()` and seeds demo data if the database is empty
4. Check `GET /health` — expect `"database": "postgresql"`, `"canConnect": true`

If Postgres is in a **different** Railway project, copy `DATABASE_PUBLIC_URL` from the Postgres service into the API variables instead of using private `*.railway.internal` URLs.

**Existing databases** created before migrations (via `EnsureCreated`) are detected automatically and stamped with the initial migration — no manual step required.

See [`docs/database-migrations.md`](database-migrations.md) for local migration commands.

### Generate a public URL (Railway UI)

You need a URL on the **service**, not the project:

1. Open your **project** → click the **service box** (your API / Docker service), not the project name at the top.
2. Look for one of these (Railway UI varies):
   - **Settings** tab → scroll down → **Public Networking** → **Generate Domain**
   - A **Domains** section on the service page → **Generate Domain**
   - Top-right of the service panel → **+ Domain** or globe icon
3. When asked for a **port**, choose **8080** (or whatever `PORT` shows in Variables).
4. Test: `https://homeservicesbrand-production.up.railway.app/health` → `"database": "postgresql"`, `"canConnect": true`

If you only see project-level settings, you clicked the wrong level — go back to the canvas and click the **API service card**.

---

## 3. Deploy frontend on Vercel

1. Import GitHub repo on Vercel
2. **Root Directory:** `src/frontend/web`
3. **Environment variable:**

| Name | Value |
|------|--------|
| Variable | Value |
|----------|-------|
| `API_URL` | Your Railway API URL (no trailing slash) — **required** for pricing/signup |
| `NEXT_PUBLIC_SITE_URL` | `https://home-services-brand.vercel.app` |
| `NEXT_PUBLIC_SHOW_DEMO_LOGIN` | **Leave unset** on production (demo credentials hidden). Set `true` only for local dev. |
| `NEXT_PUBLIC_API_URL` | optional — leave unset; `/api` is proxied via `API_URL` |

Legacy: if you already use `NEXT_PUBLIC_API_URL` pointing at Railway, that still works as a direct browser call.

4. Deploy → copy URL e.g. `https://gardenssorted.vercel.app`

5. Update Railway variables `Stripe__SuccessUrl`, `Stripe__CancelUrl`, and `Cors__AllowedOrigins__0` with the Vercel URL, then redeploy API.

---

## 4. Verify staging

1. Open Vercel URL → signup with new email  
2. Stripe Checkout (test card)  
3. Portal shows Active subscription  
4. Admin / Provider portals with demo accounts (re-seeded on fresh DB only)

---

## 5. GitHub Actions

- **CI** (`.github/workflows/ci.yml`) — builds on every push  
- Deploy is via Vercel/Railway GitHub integrations (recommended) rather than Actions secrets for MVP.

Optional: add Vercel/Railway deploy hooks later.

---

## Local vs staging checklist

- [ ] New `Jwt__Secret` in production (never use dev secret)  
- [ ] `Stripe__WebhookSecret` set — API refuses to start without it in production  
- [ ] `Features__BypassStripeCheckout=false` on Railway  
- [ ] Stripe webhook points to Railway URL, not `stripe listen`  
- [ ] CORS includes Vercel domain  
- [ ] `API_URL` on Vercel matches Railway URL  
- [ ] `NEXT_PUBLIC_SHOW_DEMO_LOGIN` **not** set on Vercel (demo login hints hidden)  
- [ ] Premium Stripe price IDs configured if testing upgrades  
- [ ] `Features__SeedDemoData` still `true` until go-live gate (then set `false`)
