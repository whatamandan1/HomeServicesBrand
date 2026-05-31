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
