# Staging hardening — PostgreSQL, email & AI

Staging works. These steps make it **production-ready for pilots**.

---

## 1. PostgreSQL on Railway (keeps data across redeploys)

> **Important:** API and Postgres must be in the **same Railway project** to use private URLs (`*.railway.internal`).  
> If they are in **different projects**, use **`DATABASE_PUBLIC_URL`** (see cross-project section below).

Right now SQLite on Railway **wipes customers on every redeploy**.

### Setup (same project — recommended)

1. Railway project → **+ New** → **Database** → **PostgreSQL** (in the **same project** as your API)
2. Click your **API service** → **Variables**
3. Add **one** of these:

**Option A — PG variables (best)**

```
PGHOST=${{Postgres.PGHOST}}
PGPORT=${{Postgres.PGPORT}}
PGUSER=${{Postgres.PGUSER}}
PGPASSWORD=${{Postgres.PGPASSWORD}}
PGDATABASE=${{Postgres.PGDATABASE}}
```

**Option B — Private DATABASE_URL**

| Name | Value |
|------|--------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |

(URL must contain `railway.internal`)

4. **Redeploy** the API

### Cross-project setup (API and Postgres in different projects)

Private URLs **will not work**. Use the **public** connection string:

1. Open **Postgres project** → Postgres service → **Variables**
2. Copy **`DATABASE_PUBLIC_URL`** (host looks like `*.proxy.rlwy.net`)
3. Open **API project** → API service → **Variables**
4. Set:

| Name | Value |
|------|--------|
| `DATABASE_URL` | paste full `DATABASE_PUBLIC_URL` value |

5. Redeploy API

`/health` should show `canConnect: true` and host `*.rlwy.net`.

**Long term:** move Postgres into the API project (or vice versa) so you can use private networking (faster, no public exposure).

### Verify

Open: `https://YOUR-RAILWAY-URL/health`

Should show:

```json
{
  "status": "ok",
  "database": "postgresql",
  "databaseSource": "DATABASE_URL"
}
```

If you see `"database": "sqlite"` check `databaseSource`:

| databaseSource | Fix |
|----------------|-----|
| `SQLite fallback` | `DATABASE_URL` not set on API service |
| `DATABASE_URL unresolved` | Reference typo — use Option B (paste URL) |
| `PGHOST/...` | PG vars linked — should work after redeploy |

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
