# Twilio SMS setup (UK / GardensSorted)

SMS is optional. If Twilio env vars are missing, the API skips SMS and continues normally (same pattern as SendGrid).

## Important: your personal phone is not the sender

Twilio **cannot** send SMS **from** your own mobile number. That is not how the API works.

| Role | Your personal mobile | Twilio number |
|------|---------------------|---------------|
| **FROM** (sender) | ❌ Not supported | ✅ Required — use your **free trial number** |
| **TO** (recipient, trial only) | ✅ Verify it as a **Verified Caller ID** | — |

On a **free trial**, SMS can only be sent **to numbers you have verified** (up to 5). Your phone is where test messages arrive — not what appears as the sender.

Trial includes **100 SMS** and **one free Twilio phone number** (no purchase required for basic dev).

---

## What sends SMS

| Event | Trigger |
|-------|---------|
| Welcome | Customer signup (`POST /api/auth/signup`) |
| Subscription confirmed | Stripe webhook, or dev bypass |
| Visit claimed | Provider claims a visit |
| Visit reminder | Background job (~24h before visit) |

Emails (SendGrid) cover the same events.

---

## Step 1 — Twilio account (free, no card)

1. Sign up at [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Verify your **email** and **personal mobile** (this unlocks the account — it is not your sender ID)
3. **Console → Account → Account Info** — copy **Account SID** and **Auth Token**

---

## Step 2 — Get your free trial number (not “buy”)

You need **one Twilio-owned number** as the sender. On trial this is free:

1. **Console home** → click **Get phone number**  
   Or: **Phone Numbers → Manage → Buy a number** — filter **United Kingdom**, tick **SMS**, pick the cheapest (~£1/mo is only after upgrade; trial assigns one free number)
2. Copy the number in **E.164** format, e.g. `+447XXXXXXXXX`
3. Put that in config as `FromPhoneNumber` — **not** your personal mobile

> Trial accounts can only have **one** Twilio number. Messages must be sent **from** that number (error 21607 if you use anything else).

---

## Step 3 — Verify your mobile as a recipient (trial only)

Trial accounts can only SMS **verified** numbers:

1. **Phone Numbers → Manage → Verified Caller IDs**
2. **Add a new Caller ID** → enter **your personal mobile**
3. Enter the SMS code Twilio sends you

Repeat for any other test numbers (customers, team) — max 5 on trial.

After you **upgrade** the account, you can send to any valid UK mobile without pre-verifying.

---

## Step 4 — Local config

Add to `src/backend/Sorted.Api/appsettings.Development.local.json`:

```json
{
  "Twilio": {
    "AccountSid": "ACxxxxxxxx",
    "AuthToken": "your_auth_token",
    "FromPhoneNumber": "+447XXXXXXXXX"
  }
}
```

- `FromPhoneNumber` = your **Twilio trial number** (step 2)
- When testing signup/reminders, use a **verified** mobile as the customer phone

Restart the API. Check `GET http://localhost:5080/health` — `twilioConfigured` should be `true`.

---

## Step 5 — Test without a full signup

```bash
curl http://localhost:5080/api/dev/communications-status

curl -X POST http://localhost:5080/api/dev/test-notifications \
  -H "Content-Type: application/json" \
  -d '{"email":"you@gmail.com","phone":"07XXXXXXXXX","firstName":"Dan"}'
```

Use your **verified** mobile for `phone`. Check API logs for `Twilio SMS sent`.

---

## Railway (staging)

```
Twilio__AccountSid=ACxxxxxxxx
Twilio__AuthToken=your_auth_token
Twilio__FromPhoneNumber=+447XXXXXXXXX
Features__BypassStripeCheckout=true
```

Redeploy → `/health` shows `twilioConfigured: true`.

Same trial rules apply on Railway until the account is upgraded.

---

## UK notes

- **Trial SMS** is limited to your **signup country** (UK numbers if you signed up with a UK mobile).
- Messages may include a trial prefix until you upgrade.
- **Alphanumeric sender** (e.g. `GardensSorted` instead of a phone number) works in the UK for one-way notifications but **requires a paid account** — not available on trial.
- For production launch: upgrade Twilio, then consider alphanumeric sender or a dedicated UK long code.

---

## Phone numbers on signup

UK numbers are normalized to E.164 (`07123456789` → `+447123456789`). On trial, customer phones must be **Verified Caller IDs** or SMS will fail silently (logged as warning).

---

## Skip SMS entirely

Leave all `Twilio__*` vars empty. Email via SendGrid still works for every notification type.

## Costs (dev)

- Trial: 100 SMS included, one free Twilio number
- After upgrade: ~£1/mo for a UK number + per-SMS fees
