/** Identity and eligibility checked before admin approval (not self-certified at signup). */
export const PROVIDER_VETTING_REQUIRED = [
  "Upload a photo of valid ID (e.g. passport or driving licence)",
  "Right to work in the UK as a self-employed contractor - we verify from your documents before you are approved",
  "Basic DBS check - must pass before taking paid visits",
  "Your own relevant insurance - e.g. public liability cover for gardening work",
] as const;

export const PROVIDER_INSURANCE_DECLARATION =
  "I hold my own relevant insurance for gardening work (such as public liability) and will keep it in force while taking visits through GardensSorted.";

export const PROVIDER_VETTING_SUMMARY =
  "Before approval we verify your photo ID upload, right to work as a self-employed contractor, a basic DBS check, and that you hold your own relevant insurance.";

export const PROVIDER_RTW_SUMMARY =
  "Approved gardeners are self-employed contractors, not employees. Describe the document that shows you can legally work in the UK — usually the same photo ID you uploaded above.";

export const PROVIDER_DBS_APPLY_URL = "https://www.gov.uk/request-copy-criminal-record";

export const PROVIDER_DBS_UPDATE_SERVICE_URL = "https://www.gov.uk/dbs-update-service";

export const PROVIDER_DBS_SUMMARY =
  "You need a basic DBS check before approval. If you don't have one yet, apply online through GOV.UK (currently £21.50). Enter your certificate number and issue date here once it arrives.";

export const PROVIDER_APPROVAL_PENDING_NOTE =
  "Complete the checks & documents form below - upload your photo ID, then add ID details, right to work, DBS, and insurance. We verify everything before you can claim jobs.";

/** Equipment every approved gardener must bring to each visit. */
export const PROVIDER_EQUIPMENT_REQUIRED = [
  "Lawn mower (suitable for typical domestic gardens)",
  "Edging tool or strimmer for lawn edges",
  "Watering can or hose for light watering",
  "Rake",
  "Appropriate brush or broom for tidying paths and edges",
  "Extension lead - at least 20 metres",
] as const;

export const PROVIDER_EQUIPMENT_SUMMARY =
  "Mower, strimmer or edger, hose or watering can, rake, brush, and a 20 m+ extension lead - every visit.";

/** Shown on apply page and provider portal - complements customer prep in consumer-plans. */
export const PROVIDER_EQUIPMENT_NOTE =
  "We do not supply tools. The customer provides tap and power; you bring your gear and extension lead.";

/** Declared in vetting - enables matching to customer add-on visits. */
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
  "Tick the add-on equipment you own in Checks & documents - we only assign hedge, seasonal, and patio add-on visits to gardeners with the right tools.";
