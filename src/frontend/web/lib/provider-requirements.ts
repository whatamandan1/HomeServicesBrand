/** Identity and eligibility checked before admin approval (not self-certified at signup). */
export const PROVIDER_VETTING_REQUIRED = [
  "Valid photo ID (e.g. passport or driving licence)",
  "Right to work in the UK — we will verify before you are approved",
  "Basic DBS check — must pass before taking paid visits",
  "Your own relevant insurance — e.g. public liability cover for gardening work",
] as const;

export const PROVIDER_INSURANCE_DECLARATION =
  "I hold my own relevant insurance for gardening work (such as public liability) and will keep it in force while taking visits through GardensSorted.";

export const PROVIDER_VETTING_SUMMARY =
  "Before approval we verify your ID, right to work, a basic DBS check, and that you hold your own relevant insurance.";

export const PROVIDER_APPROVAL_PENDING_NOTE =
  "Complete the checks & documents form below (ID, right to work, DBS, insurance). We verify everything before you can claim jobs.";

/** Equipment every approved gardener must bring to each visit. */
export const PROVIDER_EQUIPMENT_REQUIRED = [
  "Lawn mower (suitable for typical domestic gardens)",
  "Edging tool or strimmer for lawn edges",
  "Watering can or hose for light watering",
  "Rake",
  "Appropriate brush or broom for tidying paths and edges",
  "Extension lead — at least 20 metres",
] as const;

export const PROVIDER_EQUIPMENT_SUMMARY =
  "Mower, strimmer or edger, hose or watering can, rake, brush, and a 20 m+ extension lead — every visit.";

/** Shown on apply page and provider portal — complements customer prep in consumer-plans. */
export const PROVIDER_EQUIPMENT_NOTE =
  "We do not supply tools. The customer provides tap and power; you bring your gear and extension lead.";

/** Declared in vetting — enables matching to customer add-on visits. */
export const PROVIDER_ADDON_EQUIPMENT = [
  {
    field: "hasLeafBlower" as const,
    label: "Leaf blower",
    enables: "Seasonal tidy and leaf clearance",
    detail:
      "You own and maintain a working leaf blower suitable for domestic gardens.",
  },
  {
    field: "hasHedgeTrimmer" as const,
    label: "Hedge trimmer",
    enables: "Hedge trimming add-ons",
    detail: "Electric, battery, or petrol hedge trimmer you can use safely.",
  },
  {
    field: "hasPressureWasherForPatio" as const,
    label: "Pressure washer (patio-safe)",
    enables: "Patio and path refresh",
    detail:
      "Pressure washer with a suitable patio/path attachment or low-pressure setting so slabs, pointing, and decking are not damaged.",
  },
] as const;

export const PROVIDER_ADDON_EQUIPMENT_SUMMARY =
  "Tick the add-on equipment you own in Checks & documents — we only assign hedge, seasonal, and patio add-on visits to gardeners with the right tools.";
