# Gardener (provider) requirements

**Last updated:** 2026-05-30

---

## Approval checks (before you can claim jobs)

Every gardener must pass **vetting before admin approval**. Applying online does not mean you are approved until checks are complete.

| Check | Requirement |
|-------|-------------|
| **Photo ID** | Valid ID shown to GardensSorted (e.g. passport or driving licence) |
| **Right to work** | Legal right to work in the UK — **verified by us** before approval |
| **DBS** | **Basic DBS check passed** — required before paid visits |

After signup, gardeners complete the **Checks & documents** form in the provider portal (`/provider`). Code: `ProviderVettingRequirements.cs`, API `PUT /api/provider/me/vetting`.

**Admin:** review submitted details in the provider panel, mark ID / RTW / DBS verified, then Approve (blocked until submitted and verified).

---

## Equipment (your responsibility)

Approved gardeners must **bring their own equipment** to every visit. GardensSorted does not supply tools.

| Item | Required |
|------|----------|
| Lawn mower | Yes — suitable for typical domestic gardens |
| Edging tool or strimmer | Yes — for lawn edges |
| Watering can or hose | Yes — for light watering on site |
| Rake | Yes |
| Appropriate brush or broom | Yes — paths, edges, tidy-up |

Code: `Sorted.Core/Plans/ProviderEquipmentRequirements.cs`, frontend `src/frontend/web/lib/provider-requirements.ts`.

---

## At the customer property

| Provided by | Item |
|-------------|------|
| **Customer** | Access to water (working outdoor tap or agreed supply), outdoor power where electric tools are needed, safe garden access, garden-waste bin or self-disposal of clippings |
| **Gardener** | All tools and equipment listed above |

---

## Related

- Customer prep: [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md)
- Apply: `/providers#apply`
- Provider portal: `/provider`
