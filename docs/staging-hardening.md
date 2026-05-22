# Staging hardening — PostgreSQL, email & AI

Staging works. These steps make it **production-ready for pilots**.

---

## 1. PostgreSQL on Railway (keeps data across redeploys)

Right now SQLite on Railway **wipes customers on every redeploy**.

### Setup

1. Railway project → **+ New** → **Database** → **PostgreSQL**
2. Click your **API service** → **Variables** → **Add variable reference** (or **Connect** Postgres)
3. Add reference: `DATABASE_URL` from the Postgres service  
   (Railway often adds this automatically when you link services)
4. **Redeploy** the API

### Verify

Check API deploy logs on startup:

```
Sorted API ready — DB: PostgreSQL | Stripe: ok | ...
```

Push the latest code first if you haven't (PostgreSQL support is in the repo):

```bash
git add .
git commit -m "Add PostgreSQL support for Railway"
git push
```

---

## 2. SendGrid (transactional email)

1. https://sendgrid.com → create account → **Settings → API Keys** → Create key (Mail Send)
2. **Settings → Sender Authentication** → verify a single sender (e.g. `hello@gardenssorted.co.uk`)
3. Railway → API **Variables**:

| Variable | Value |
|----------|---------|
| `SendGrid__ApiKey` | `SG....` |
| `SendGrid__FromEmail` | your verified sender |
| `SendGrid__FromName` | `GardensSorted` |

4. Redeploy API

Emails sent on: welcome (signup), subscription confirmed (payment webhook).

---

## 3. OpenAI (support chat)

1. https://platform.openai.com/api-keys → create key
2. Railway → API **Variables**:

| Variable | Value |
|----------|---------|
| `OpenAI__ApiKey` | `sk-...` |
| `OpenAI__Model` | `gpt-4o-mini` (optional) |

3. Redeploy API

Test: Customer portal → Support chat. Without a key, you get a dev fallback message.

---

## 4. Security checklist (before real customers)

| Item | Action |
|------|--------|
| `Jwt__Secret` | Strong random string (32+ chars), unique to staging |
| Stripe | Test mode for staging; live keys only when launching |
| Admin password | Change demo admin after first login (future: force password change) |
| Secrets | Never commit `appsettings.Development.local.json` |

---

## 5. Optional next builds

- Custom domain on Vercel (`gardenssorted.co.uk`)
- Stripe **live** mode + live webhook
- Provider self-registration approval flow polish
- Azure migration path (when scaling)

---

## Quick test after PostgreSQL + SendGrid + OpenAI

1. New signup on Vercel URL  
2. Check email inbox (welcome + subscription)  
3. Portal → support chat → real AI reply  
4. Redeploy API → **same customer still in admin** (PostgreSQL working)
