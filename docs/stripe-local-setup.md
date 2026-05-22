# Stripe end-to-end (local)

## What you need

1. A [Stripe account](https://dashboard.stripe.com/register) (test mode is fine)
2. [Stripe CLI](https://stripe.com/docs/stripe-cli#install) installed on your Mac
3. API and frontend already running locally

## Step 1 — Get your test secret key

1. Open https://dashboard.stripe.com/test/apikeys  
2. Copy **Secret key** (`sk_test_...`)

## Step 2 — Configure the API

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

**Restart the API** after saving.

## Step 3 — Forward webhooks to your API

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

## Step 4 — Test signup

1. http://localhost:3000/signup — use a **new email** (not one already registered)
2. Submit the form → you should redirect to **Stripe Checkout** (stripe.com), not straight to the portal
3. Pay with test card:
   - Number: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Postcode: any valid UK format e.g. `LS1 1AA`
4. After payment → http://localhost:3000/signup/success
5. Go to **Customer portal** — subscription should be **Active**
6. **Admin** — customer count up, open visits for dispatch
7. **Provider** — open jobs in matching postcode sector (e.g. `LS1`)

In the `stripe listen` terminal you should see:

```
checkout.session.completed [200]
```

In the API logs:

```
payment_succeeded
visits_generated
```

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| Skips Stripe, goes straight to portal | `SecretKey` empty or config file not loaded — check `appsettings.Development.local.json`, restart API |
| Checkout works but subscription stays Pending | Webhook not running or wrong `WebhookSecret` — check `stripe listen`, restart API |
| `Stripe SecretKey is not configured` | Same as above |
| Email already registered | Use a new email or delete `sorted.db` and restart API (re-seeds demo data) |
| Port 5080 in use | `dotnet build-server shutdown` and `lsof -i :5080` |

## Optional — Stripe Dashboard webhook (without CLI)

For deployed environments, add endpoint in Stripe Dashboard → Developers → Webhooks:

- URL: `https://your-api-host/api/webhooks/stripe`
- Event: `checkout.session.completed`
- Use the signing secret from the dashboard in production config

Local development should use **Stripe CLI** (`stripe listen`), not a Dashboard URL pointing to localhost.
