# Dev setup - costs, email & skipping payment

## Personal email for SendGrid (fine for now)

For staging/dev, verify your **personal email** as a SendGrid Single Sender:

1. SendGrid → **Settings → Sender Authentication → Verify Single Sender**
2. Railway: `SendGrid__FromEmail` = that exact address

**When you get a business inbox** (e.g. `hello@gardenssorted.co.uk`):

1. Verify the new address (or set up domain authentication) in SendGrid
2. Update Railway only:
   - `SendGrid__FromEmail` → new address
   - `SendGrid__FromName` → `GardensSorted`
3. Redeploy API - no code changes

Domain authentication is recommended before launch (better deliverability than single sender).

---

## Avoid paying during dev

| Service | Dev approach | Cost |
|---------|----------------|------|
| **Stripe (customer subs)** | Test mode keys **or** bypass checkout (below) | **£0** - test cards never charge real money |
| **SendGrid** | Free tier (~100 emails/day) | **£0** |
| **Twilio SMS** | Trial credit; verify your mobile on trial | **£0** for light testing |
| **OpenAI** | Optional - omit `OpenAI__ApiKey` until needed; or set [usage limits](https://platform.openai.com/settings/organization/limits) | Pay-as-you-go, pennies for testing |
| **Railway** | Hobby/free credits | varies |
| **Vercel** | Free tier for hobby | **£0** |

### Skip Stripe checkout on staging (no payment step)

Useful for demos and internal testing without even hitting Stripe Checkout.

Railway → API service → **Variables**:

```
Features__BypassStripeCheckout=true
```

Redeploy API + redeploy Vercel (frontend reads this flag).

Signup will show **“Dev mode: payment skipped”** and go straight to the portal.

**Before launch:** set to `false` or remove the variable, use Stripe **live** keys, and test real checkout.

### Stripe test mode (alternative)

If bypass is **off**, keep `Stripe__SecretKey` as `sk_test_...` - customers use test card `4242 4242 4242 4242`. **No real money** moves; you still exercise the full payment flow.

---

## Recommended staging variables (dev-friendly)

```
Features__BypassStripeCheckout=true
Stripe__SecretKey=sk_test_...          # optional while bypass is on
SendGrid__ApiKey=SG...                 # free tier
SendGrid__FromEmail=your@gmail.com     # your verified personal sender
SendGrid__FromName=GardensSorted
Twilio__AccountSid=AC...               # optional - see docs/twilio-sms-setup.md
Twilio__AuthToken=...
Twilio__FromPhoneNumber=+44...
OpenAI__ApiKey=                        # leave empty to skip AI costs
```

---

## OpenAI without spending

- Leave `OpenAI__ApiKey` empty → chat returns a short fallback message (free)
- When ready: add key + set a monthly budget cap in OpenAI dashboard

---

## Launch checklist (when leaving dev)

- [ ] `Features__BypassStripeCheckout` = **false** or removed
- [ ] Stripe **live** keys + live webhook
- [ ] SendGrid domain or business sender verified
- [ ] `SendGrid__FromEmail` = business address
- [ ] Strong `Jwt__Secret` on Railway
