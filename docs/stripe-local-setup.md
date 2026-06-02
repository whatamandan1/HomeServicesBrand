# Stripe end-to-end (local)

## What you need

1. A [Stripe account](https://dashboard.stripe.com/register) (test mode is fine)
2. [Stripe CLI](https://stripe.com/docs/stripe-cli#install) installed on your Mac
3. API and frontend already running locally

## Step 1 - Get your test secret key

1. Open https://dashboard.stripe.com/test/apikeys  
2. Copy **Secret key** (`sk_test_...`)

## Step 2 - Configure the API

From the repo:

```bash
cd src/backend/Sorted.Api
cp appsettings.Development.local.json.example appsettings.Development.local.json
```

Edit `appsettings.Development.local.json`:

```json
{
  "Stripe": {
    "SecretKey": "sk_test_PASTE_YOUR_KEY",
    "WebhookSecret": "whsec_WILL_PASTE_AFTER_STEP_3"
  }
}
```

Leave `SuccessUrl` / `CancelUrl` as in `appsettings.json` unless you changed ports.

**Optional (production):** create recurring **Prices** in Stripe Dashboard → Products for all six plans, then set:

```json
"Prices": {
  "EssentialMonthly": "price_xxx",
  "EssentialAnnual": "price_yyy",
  "PremiumMonthly": "price_xxx",
  "PremiumAnnual": "price_yyy",
  "EliteMonthly": "price_xxx",
  "EliteAnnual": "price_yyy"
}
```

Full amounts and pre-deploy checklist: [`stripe-price-ids-checklist.md`](stripe-price-ids-checklist.md).

If omitted, Checkout creates dynamic recurring prices from plan amounts (fine for local dev).

**Restart the API** after saving.

## Step 3 - Forward webhooks to your API

In a **new terminal** (keep API running on 5080):

```bash
stripe login
stripe listen --forward-to localhost:5080/api/webhooks/stripe
```

Copy the webhook signing secret printed on startup, e.g.:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxx
```

Paste that into `appsettings.Development.local.json` as `WebhookSecret`, then **restart the API** again.

Leave `stripe listen` running while you test.

### Webhook events handled

| Event | Purpose |
|-------|---------|
| `checkout.session.completed` | Activate subscription after first Checkout payment |
| `invoice.paid` | Record renewal payments; restore Active after retry |
| `invoice.payment_failed` | Mark subscription **PastDue** |
| `customer.subscription.updated` | Sync status from Stripe |
| `customer.subscription.deleted` | Mark subscription **Cancelled** |

## Step 4 - Test signup

1. http://localhost:3000/signup - use a **new email** (not one already registered)
2. Submit the form → you should redirect to **Stripe Checkout** (stripe.com), not straight to the portal
3. Pay with test card:
   - Number: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Postcode: any valid UK format e.g. `LS1 1AA`
4. After payment → http://localhost:3000/signup/success
5. Go to **Customer portal** - subscription should be **Active**
6. **Admin** - customer count up, open visits for dispatch
7. **Provider** - open jobs in matching postcode sector (e.g. `LS1`)

In the `stripe listen` terminal you should see:

```
checkout.session.completed [200]
invoice.paid [200]
```

In the API logs:

```
payment_succeeded
visits_generated
```

## Recurring billing

Checkout uses **subscription mode** - Stripe automatically charges monthly or annual based on the plan. Renewals fire `invoice.paid` webhooks; failed payments fire `invoice.payment_failed` and set the subscription to **PastDue**.

To simulate a failed renewal in test mode, use card `4000 0000 0000 0341` (requires authentication / fails on renewal depending on setup) or use Stripe Dashboard → Subscriptions → simulate invoice failure.

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Skips Stripe, goes straight to portal | `SecretKey` empty or config file not loaded - check `appsettings.Development.local.json`, restart API |
| Checkout works but subscription stays Pending | Webhook not running or wrong `WebhookSecret` - check `stripe listen`, restart API |
| `Stripe SecretKey is not configured` | Same as above |
| Email already registered | Use a new email or delete `sorted.db` and restart API (re-seeds demo data) |
| Port 5080 in use | `dotnet build-server shutdown` and `lsof -i :5080` |

## Optional - Stripe Dashboard webhook (without CLI)

For deployed environments, add endpoint in Stripe Dashboard → Developers → Webhooks:

- URL: `https://your-api-host/api/webhooks/stripe`
- Events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- Use the signing secret from the dashboard in production config

Local development should use **Stripe CLI** (`stripe listen`), not a Dashboard URL pointing to localhost.

## Creating Stripe Prices (production)

Use [`stripe-price-ids-checklist.md`](stripe-price-ids-checklist.md) for the full matrix and checkout behaviour.

Quick summary - create **three monthly** recurring prices for small garden (≤50 m²), copy `price_...` to Railway, redeploy API:

| Plan | Amount (small garden, monthly) |
|------|--------------------------------|
| Essential Monthly | £59.99/mo |
| Premium Monthly | £84.99/mo |
| Elite Monthly | £119.99/mo |

**All other combinations** (medium/large bands, add-ons, annual billing) use dynamic checkout — no Stripe catalog entry needed.
