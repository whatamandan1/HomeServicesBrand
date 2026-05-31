# Custom domain setup - gardenssorted.co.uk + gardenssorted.com

**Canonical site:** https://gardenssorted.co.uk  
**Secondary domain:** https://gardenssorted.com → redirect to `.co.uk` (recommended)  
**API (unchanged):** https://homeservicesbrand-production.up.railway.app

Use **`.co.uk` as canonical** - email, legal copy, and Stripe redirects all use the UK domain. Point **`.com` at the same Vercel project** and 301-redirect it to `.co.uk` so SEO and share links stay consistent.

---

## 1. Vercel (frontend)

### Where things are in the dashboard (2026 UI)

Vercel moves labels between releases. Use these paths:

| Setting | Path A (most common) | Path B (if A is missing) |
|---------|----------------------|---------------------------|
| **Root Directory** | Project → **Settings** (sidebar) → **Build and Deployment** → scroll to **Root Directory** | Project → **Settings** → **General** → **Build and development settings** |
| **Domains** | Project → **Settings** → **Domains** | Project home → **Domains** in the left sidebar (same level as Deployments) |
| **Env vars** | Project → **Settings** → **Environment Variables** | Project → **Storage** tab area is wrong - stay under Settings |

You must be on the **project** (e.g. `home-services-brand`), not the **team** overview. Use the team switcher top-left if needed.

**Root Directory** value for this repo: `src/frontend/web`

### Add domains

1. Open **Domains** (see table above) → add all of these to the **same** project:
   - `gardenssorted.co.uk` (primary)
   - `www.gardenssorted.co.uk` (optional - redirect to apex)
   - `gardenssorted.com`
   - `www.gardenssorted.com` (optional - redirect to apex)
2. Configure DNS at each registrar per Vercel’s instructions (A/CNAME records).
3. In Vercel domain settings, set **redirects**:
   - `gardenssorted.com` → `https://gardenssorted.co.uk`
   - `www.gardenssorted.com` → `https://gardenssorted.co.uk`
   - `www.gardenssorted.co.uk` → `https://gardenssorted.co.uk` (if you use www)
4. Set **Environment variable** (Production):

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SITE_URL` | `https://gardenssorted.co.uk` |

5. Redeploy the frontend.

With redirects in place, visitors on `.com` land on `.co.uk` before any API calls - you only need one origin in CORS.

---

## 2. Railway (API)

Update variables on the API service, then **Redeploy**:

| Variable | Value |
|----------|--------|
| `Cors__AllowedOrigins__0` | `https://gardenssorted.co.uk` |
| `Cors__AllowedOrigins__1` | `http://localhost:3000` |
| `Stripe__SuccessUrl` | `https://gardenssorted.co.uk/signup/success` |
| `Stripe__CancelUrl` | `https://gardenssorted.co.uk/signup` |
| `Stripe__BillingPortalReturnUrl` | `https://gardenssorted.co.uk/portal` |
| `App__FrontendBaseUrl` | `https://gardenssorted.co.uk` |

### If `.com` serves the app without redirecting

Add extra CORS origins (only needed if users can browse on `.com` without being redirected):

| Variable | Value |
|----------|--------|
| `Cors__AllowedOrigins__2` | `https://gardenssorted.com` |
| `Cors__AllowedOrigins__3` | `https://www.gardenssorted.com` |

Prefer redirect over extra CORS entries - one canonical URL is simpler for Stripe, SEO, and email links.

---

## 3. Stripe

No webhook URL change (still points at Railway).

Checkout success/cancel and billing portal return URLs should use the **canonical** `.co.uk` domain (Railway vars above).

---

## 4. Smoke test

Run on **https://gardenssorted.co.uk**:

- [ ] Homepage loads with correct OG metadata
- [ ] `/signup` → Stripe Checkout → `/signup/success` → `/portal`
- [ ] `/login` as admin → `/admin` CRM loads
- [ ] `/multi-property-solutions` enquiry submits
- [ ] Provider claim → start → complete flow
- [ ] No CORS errors in browser console

Also verify redirects:

- [ ] `https://gardenssorted.com` → `https://gardenssorted.co.uk`
- [ ] `https://www.gardenssorted.com` → `https://gardenssorted.co.uk` (if configured)

---

## 5. Keep vercel.app as alias (optional)

Leave `home-services-brand.vercel.app` attached in Vercel and redirect it to `gardenssorted.co.uk` so old links still work.

---

## Domain summary

| Domain | Role |
|--------|------|
| `gardenssorted.co.uk` | Canonical - SEO, Stripe, email, `NEXT_PUBLIC_SITE_URL` |
| `gardenssorted.com` | Redirect to `.co.uk` (same Vercel project) |
| `hello@gardenssorted.co.uk` | Transactional email sender (SendGrid) |
| `home-services-brand.vercel.app` | Legacy alias → redirect (optional) |
