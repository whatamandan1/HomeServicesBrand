/** Identity and eligibility checked before admin approval (not self-certified at signup). */
export const PROVIDER_VETTING_REQUIRED = [
  "Valid photo ID (e.g. passport or driving licence)",
  "Right to work in the UK — we will verify before you are approved",
  "Basic DBS check — must pass before taking paid visits",
] as const;

export const PROVIDER_VETTING_SUMMARY =
  "Before approval we verify your ID, right to work in the UK, and a basic DBS check.";

export const PROVIDER_APPROVAL_PENDING_NOTE =
  "Complete the checks & documents form below (ID, right to work, DBS). We verify everything before you can claim jobs.";

/** Equipment every approved gardener must bring to each visit. */
export const PROVIDER_EQUIPMENT_REQUIRED = [
  "Lawn mower (suitable for typical domestic gardens)",
  "Edging tool or strimmer for lawn edges",
  "Watering can or hose for light watering",
  "Rake",
  "Appropriate brush or broom for tidying paths and edges",
] as const;

export const PROVIDER_EQUIPMENT_SUMMARY =
  "You must have your own equipment on every visit — mower, edging tool or strimmer, watering can or hose, rake, and an appropriate brush.";

/** Shown on apply page and provider portal — complements customer prep in consumer-plans. */
export const PROVIDER_EQUIPMENT_NOTE =
  "GardensSorted does not supply tools. Customers provide access to water (e.g. outdoor tap) and power at the property where needed; you bring everything required to complete the work.";

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
