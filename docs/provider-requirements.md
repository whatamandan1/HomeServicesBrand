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
| **Insurance** | **Your own relevant insurance** — e.g. public liability for gardening work; declared at signup and **verified by us** before approval |

After signup, gardeners complete the **Checks & documents** form in the provider portal (`/provider`). Code: `ProviderVettingRequirements.cs`, API `PUT /api/provider/me/vetting`.

**Admin:** review submitted details in the provider panel, mark ID / RTW / DBS / insurance verified, then Approve (blocked until submitted and verified).

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
| Extension lead | Yes — **at least 20 metres** (when using electric tools and the customer provides power access) |

Code: `Sorted.Core/Plans/ProviderEquipmentRequirements.cs`, frontend `src/frontend/web/lib/provider-requirements.ts`.

### Add-on equipment (declare in vetting)

To receive **hedge**, **seasonal tidy / leaf clearance**, or **patio & path refresh** add-on visits, gardeners must own the matching tools and tick them in **Checks & documents** (`/provider`):

| Equipment | Customer add-ons enabled |
|-----------|--------------------------|
| **Leaf blower** | Seasonal tidy, leaf clearance |
| **Hedge trimmer** | Hedge trimming |
| **Pressure washer** with patio-safe attachment or low-pressure setting | Patio & path refresh (avoid damaging slabs, pointing, decking) |

Stored on `Provider`: `HasLeafBlower`, `HasHedgeTrimmer`, `HasPressureWasherForPatio`. Code: `ProviderAddonEquipmentRequirements.cs`.

Admin should only assign matching add-on visits when the provider has declared the tool (see provider vetting panel).

---

## At the customer property

| Provided by | Item |
|-------------|------|
| **Customer** | Clear access and lawn, tap, power socket (indoor OK), clippings or garden-waste bin |
| **Gardener** | All tools and equipment listed above, including extension lead of at least 20 m |

---

## Related

- Customer prep: [`consumer-plans-and-pricing.md`](consumer-plans-and-pricing.md)
- Apply: `/providers#apply`
- Provider portal: `/provider`
