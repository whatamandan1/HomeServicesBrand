# Deploy staging (Vercel + Railway)

## Overview

| Component | Host | Notes |
|-----------|------|--------|
| Frontend | [Vercel](https://vercel.com) | Next.js in `src/frontend/web` |
| API | [Railway](https://railway.app) | Docker from `src/backend/Dockerfile` |

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
| `Stripe__SuccessUrl` | `https://YOUR-VERCEL-URL/signup/success` |
| `Stripe__CancelUrl` | `https://YOUR-VERCEL-URL/signup` |
| `SendGrid__ApiKey` | optional |
| `OpenAI__ApiKey` | optional |
| `Cors__AllowedOrigins__0` | `https://YOUR-VERCEL-URL` |
| `Cors__AllowedOrigins__1` | `http://localhost:3000` |

4. Deploy → **Generate a public URL** (see below) → copy e.g. `https://sorted-api-production.up.railway.app`

**Stripe webhook (staging):**

- Dashboard → Developers → Webhooks → Add endpoint  
- URL: `https://YOUR-RAILWAY-URL/api/webhooks/stripe`  
- Event: `checkout.session.completed`  
- Paste signing secret into `Stripe__WebhookSecret`

**Note:** SQLite on Railway is ephemeral (resets on redeploy). Fine for demos; use PostgreSQL for persistent staging.

### Generate a public URL (Railway UI)

You need a URL on the **service**, not the project:

1. Open your **project** → click the **service box** (your API / Docker service), not the project name at the top.
2. Look for one of these (Railway UI varies):
   - **Settings** tab → scroll down → **Public Networking** → **Generate Domain**
   - A **Domains** section on the service page → **Generate Domain**
   - Top-right of the service panel → **+ Domain** or globe icon
3. When asked for a **port**, choose **8080** (or whatever `PORT` shows in Variables).
4. Test: `https://YOUR-URL.up.railway.app/health` → `{"status":"ok"}`

If you only see project-level settings, you clicked the wrong level — go back to the canvas and click the **API service card**.

---

## 3. Deploy frontend on Vercel

1. Import GitHub repo on Vercel
2. **Root Directory:** `src/frontend/web`
3. **Environment variable:**

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_API_URL` | Your Railway API URL (no trailing slash) |

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
- [ ] Stripe webhook points to Railway URL, not `stripe listen`  
- [ ] CORS includes Vercel domain  
- [ ] `NEXT_PUBLIC_API_URL` matches Railway URL  
