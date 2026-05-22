# Twilio SMS setup

SMS is optional. If Twilio env vars are missing, the API skips SMS and continues normally (same pattern as SendGrid).

## What sends SMS

| Event | Trigger |
|-------|---------|
| Welcome | Customer signup (`POST /api/auth/signup`) |
| Subscription confirmed | Stripe `checkout.session.completed` webhook, or dev bypass `POST /api/dev/activate-subscription/{id}` |
| Visit claimed | Provider claims a visit (`POST /api/provider/visits/claim`) — notifies the customer |

## Twilio console

1. Sign up at [twilio.com](https://www.twilio.com).
2. **Console → Account → Account Info** — copy **Account SID** and **Auth Token**.
3. **Phone Numbers → Manage → Buy a number** (UK mobile or local works for testing).
4. Note the number in **E.164** format (e.g. `+447700900000`).

Trial accounts can only SMS **verified** recipient numbers. Add your mobile under **Phone Numbers → Verified Caller IDs** before testing.

## Local config

Add to `src/backend/Sorted.Api/appsettings.Development.local.json`:

```json
{
  "Twilio": {
    "AccountSid": "ACxxxxxxxx",
    "AuthToken": "your_auth_token",
    "FromPhoneNumber": "+447700900000"
  }
}
```

Restart the API and check `GET http://localhost:5080/health` — `twilioConfigured` should be `true`.

## Railway (staging)

In the API service **Variables**:

```
Twilio__AccountSid=ACxxxxxxxx
Twilio__AuthToken=your_auth_token
Twilio__FromPhoneNumber=+447700900000
```

Redeploy, then confirm `/health` shows `twilioConfigured: true`.

## Phone numbers on signup

UK numbers are normalized to E.164 (`07123456789` → `+447123456789`). Signup already collects `phone` — use a real mobile you can verify on a Twilio trial.

## Costs (dev)

- Twilio trial includes a small credit.
- UK SMS is typically a few pence per message.
- Leave Twilio vars empty to disable SMS entirely.
