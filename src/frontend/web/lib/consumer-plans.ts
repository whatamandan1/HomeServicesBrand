import type { GardenSize, SubscriptionPlan } from "@/lib/api";
import { formatGbp } from "@/lib/format";

/** Annual checkout ≈ 10× monthly (~two months free). Mirrors `GardenSizePricing` in the API. */
export const ANNUAL_MONTHS_CHARGED = 10;

export const PREMIUM_MONTHLY_ADDON_GBP = 25;
export const ELITE_MONTHLY_ADDON_GBP = 60;

/** Lawn, beds, and edges we maintain — not whole-plot area or large paved zones. */
export const GARDEN_SIZE_MAINTAINED_AREA_NOTE =
  "Lawn, planted beds, and edges we cut and tidy on each visit — not your whole plot, large paving, or areas out of scope.";

export const GARDEN_SIZE_ABOVE_BAND_NOTE =
  "More than 150 m² maintained? Contact us for a personalised quote.";

export const GARDEN_SIZE_ORDER: GardenSize[] = ["Small", "Medium", "Large"];

/** Essential monthly price by garden band (GBP). */
export const GARDEN_SIZE_MONTHLY_PRICE_GBP: Record<GardenSize, number> = {
  Small: 59.99,
  Medium: 79.99,
  Large: 99.99,
};

/** Provider pay per visit (GBP). */
export const PROVIDER_VISIT_PAY_GBP: Record<GardenSize, number> = {
  Small: 20,
  Medium: 30,
  Large: 40,
};

/** Target provider time on site (hours). */
export const GARDEN_SIZE_VISIT_HOURS: Record<GardenSize, number> = {
  Small: 1,
  Medium: 1.5,
  Large: 2,
};

export const GARDEN_SIZE_GUIDE: Record<
  GardenSize,
  {
    label: string;
    shortName: string;
    description: string;
    examples: string;
    maxSqm: number;
    visitHours: number;
    monthlyPrice: number;
    providerPerVisit: number;
  }
> = {
  Small: {
    shortName: "Small",
    label: "Up to 50 m²",
    maxSqm: 50,
    visitHours: 1,
    monthlyPrice: 59.99,
    providerPerVisit: 20,
    description: "Courtyard, terrace, or compact town garden.",
    examples: "Up to 50 m² maintained — about 1 hour per visit.",
  },
  Medium: {
    shortName: "Medium",
    label: "Up to 100 m²",
    maxSqm: 100,
    visitHours: 1.5,
    monthlyPrice: 79.99,
    providerPerVisit: 30,
    description: "Typical suburban rear garden.",
    examples: "Up to 100 m² maintained — about 1.5 hours per visit.",
  },
  Large: {
    shortName: "Large",
    label: "Up to 150 m²",
    maxSqm: 150,
    visitHours: 2,
    monthlyPrice: 99.99,
    providerPerVisit: 40,
    description: "Larger family garden or generous plot.",
    examples: "Up to 150 m² maintained — about 2 hours per visit.",
  },
};

export function gardenSizeSelectLabel(size: GardenSize): string {
  const g = GARDEN_SIZE_GUIDE[size];
  return `${g.shortName} (${g.label} maintained)`;
}

/** Core maintenance on every plan tier (visit frequency differs by tier). */
export const CORE_VISIT_WORK = [
  "Lawn mowing and edging",
  "Weeding in borders and planted beds",
  "General garden clean-up and tidy",
  "Light watering of pots, beds & obvious dry spots while on site",
] as const;

export const ESSENTIAL_FEATURES = [
  "10 professional visits per year",
  ...CORE_VISIT_WORK,
  "Reschedule or cancel visits in your account",
  "Customer support when you need help",
];

export const PREMIUM_FEATURES = [
  "Everything in Essential",
  "20 visits per year",
  "Light hedge trim and shaping (where accessible)",
  "Seasonal tidy — leaf blow/clear in garden, light pruning",
  "Priority scheduling where possible",
];

export const ELITE_FEATURES = [
  "Everything in Premium",
  "30 visits per year",
  "1× thorough patio & path refresh per year (included)",
  "First-choice visit windows when booking",
  "Ideal for fast-growing lawns and high-use gardens",
  "Consistent upkeep through peak growing season",
];

export const ON_VISIT_WHEN_POSSIBLE = [
  "Light sweep of garden-adjacent patio or paths (not a deep clean)",
  "Autumn leaf blow and clear within the maintained garden area (Premium & Elite visits)",
];

export const SEASONAL_ADDONS = [
  "Thorough patio and deck cleaning (1× per year included on Elite)",
  "Dedicated leaf clearance (large volumes or whole-property)",
  "Gutter clearing (quoted separately — access and height assessed)",
];

/** Shown at signup, pricing, and linked from terms — customer must prepare the garden. */
export const CUSTOMER_VISIT_RESPONSIBILITIES = [
  "Dispose of grass and green waste yourself, or provide a suitable council garden-waste bin on collection day",
  "Clear the lawn and garden of obstructions before each visit (furniture, toys, tools, branches)",
  "Remove or secure pet waste from areas we maintain",
  "Provide safe access to the garden (unlocked gate, clear path, friendly pets secured)",
  "Provide access to water — working outdoor tap or supply to the garden (gardeners bring their own hose or watering can)",
  "Provide an outdoor power supply where electric tools are needed (extension lead from your property is fine)",
] as const;

export const NOT_INCLUDED = [
  "Hauling green waste off site (unless you provide a garden-waste bin we can fill)",
  "Separate watering visits between scheduled maintenance",
  "Tree surgery, tall hedge reduction, or major clearance",
  "Landscaping, irrigation install/repair, or pest treatment",
  "Standalone pressure washing or gutter cleans unless booked as an add-on",
];

export const SHARED_FEATURES = [
  "Vetted local gardeners in your area",
  "Visits in your preferred time window",
  "Online account for visits and billing",
];

export type PlanTier = "essential" | "premium" | "elite";
export type BillingChoice = "Monthly" | "Annual";

export const ANNUAL_BILLING_BADGE = "Best value";
export const ANNUAL_BILLING_SAVINGS = "Save ~2 months";
export const ANNUAL_BILLING_HINT =
  "Pay once a year and get about two months free compared with monthly billing.";

export function annualEquivalentMonthly(priceGbp: number): number {
  return Math.round((priceGbp / 12) * 100) / 100;
}

export type PlanCompareRow = {
  label: string;
  essential: boolean | string;
  premium: boolean | string;
  elite: boolean | string;
};

/** Side-by-side feature matrix for Essential / Premium / Elite. */
export const PLAN_COMPARE_ROWS: PlanCompareRow[] = [
  { label: "Visits included", essential: "10 / year", premium: "20 / year", elite: "30 / year" },
  { label: "Typical visit spacing", essential: "~every 5–6 weeks", premium: "Fortnightly", elite: "Weekly" },
  { label: "Lawn mowing & edging", essential: true, premium: true, elite: true },
  { label: "Border weeding & general tidy", essential: true, premium: true, elite: true },
  { label: "You dispose of clippings or provide a garden-waste bin", essential: true, premium: true, elite: true },
  { label: "Light watering (you provide tap; gardener brings hose)", essential: true, premium: true, elite: true },
  { label: "Hedge trim & shaping", essential: false, premium: true, elite: true },
  { label: "Seasonal tidy & leaf blow", essential: false, premium: true, elite: true },
  { label: "Priority scheduling", essential: false, premium: true, elite: false },
  { label: "First-choice visit windows", essential: false, premium: false, elite: true },
  { label: "Patio & path refresh", essential: false, premium: false, elite: "1× per year" },
  { label: "Reschedule in your account", essential: true, premium: true, elite: true },
];

export const PLAN_TIERS: { id: PlanTier; label: string; tagline: string }[] = [
  { id: "essential", label: "Essential", tagline: "Monthly upkeep" },
  { id: "premium", label: "Premium", tagline: "20 visits a year + hedges" },
  { id: "elite", label: "Elite", tagline: "30 visits a year + patio refresh" },
];

export type SignupServiceId =
  | "lawn-borders"
  | "hedges"
  | "seasonal"
  | "monthly"
  | "fortnightly"
  | "weekly"
  | "patio";

export type SignupServiceGroup = "core" | "addons" | "visit-frequency";

export type SignupServiceOption = {
  id: SignupServiceId;
  label: string;
  description: string;
  minTier: PlanTier;
  group: SignupServiceGroup;
};

/** Services shown during signup — selections drive automatic plan matching. */
export const SIGNUP_SERVICES: SignupServiceOption[] = [
  {
    id: "lawn-borders",
    label: "Lawn mowing, edging, weeding & tidy",
    description: "Mow and edge the lawn, weed borders and beds, and general clean-up each visit.",
    minTier: "essential",
    group: "core",
  },
  {
    id: "hedges",
    label: "Hedge trim & shaping",
    description: "Light shaping where safely reachable from ground level.",
    minTier: "premium",
    group: "addons",
  },
  {
    id: "seasonal",
    label: "Seasonal tidy & leaf clearance",
    description: "Autumn leaf blow, light pruning, and general neatening.",
    minTier: "premium",
    group: "addons",
  },
  {
    id: "monthly",
    label: "10 a year",
    description: "10 visits per year (~every 5–6 weeks) — Essential.",
    minTier: "essential",
    group: "visit-frequency",
  },
  {
    id: "fortnightly",
    label: "20 a year",
    description: "20 visits per year (~fortnightly) — Premium.",
    minTier: "premium",
    group: "visit-frequency",
  },
  {
    id: "weekly",
    label: "30 a year",
    description: "30 visits per year (~weekly in season) — Elite.",
    minTier: "elite",
    group: "visit-frequency",
  },
  {
    id: "patio",
    label: "Patio & path refresh",
    description: "One thorough clean of garden paving or decking per year.",
    minTier: "elite",
    group: "addons",
  },
];

export const SIGNUP_SERVICE_GROUP_LABELS: Record<SignupServiceGroup, string> = {
  core: "Included on every visit",
  addons: "Add-on services",
  "visit-frequency": "Visit frequency",
};

/** Optional extras on signup step 2 (core maintenance is always included). */
export const SIGNUP_ADDON_SERVICE_IDS: SignupServiceId[] = ["hedges", "seasonal", "patio"];

export const SIGNUP_VISIT_FREQUENCY_IDS: SignupServiceId[] = ["monthly", "fortnightly", "weekly"];

export function isVisitFrequencyService(id: SignupServiceId): boolean {
  return SIGNUP_VISIT_FREQUENCY_IDS.includes(id);
}

export function signupVisitFrequencyOptions(): SignupServiceOption[] {
  return SIGNUP_VISIT_FREQUENCY_IDS.map((id) => SIGNUP_SERVICES.find((s) => s.id === id)).filter(
    (s): s is SignupServiceOption => s !== undefined
  );
}

/** Checkbox groups on signup (visit frequency uses a separate segmented control). */
export const SIGNUP_CHECKBOX_GROUPS: SignupServiceGroup[] = ["addons"];

const TIER_RANK: Record<PlanTier, number> = {
  essential: 0,
  premium: 1,
  elite: 2,
};

export function tierFromRank(rank: number): PlanTier {
  if (rank >= 2) return "elite";
  if (rank >= 1) return "premium";
  return "essential";
}

/** Pick the lowest tier that covers every selected service. */
export function matchPlanTierFromServices(selected: SignupServiceId[]): PlanTier {
  if (selected.length === 0) return "essential";
  let maxRank = 0;
  for (const id of selected) {
    const option = SIGNUP_SERVICES.find((s) => s.id === id);
    if (option) maxRank = Math.max(maxRank, TIER_RANK[option.minTier]);
  }
  return tierFromRank(maxRank);
}

function isElitePlan(name: string) {
  return name.toLowerCase().includes("elite");
}

function isPremiumPlan(name: string) {
  return name.toLowerCase().includes("premium");
}

function isAnnualPlan(plan: SubscriptionPlan) {
  return plan.billingInterval !== "Monthly";
}

function tierMonthlyAddon(plan: SubscriptionPlan): number {
  if (isElitePlan(plan.name)) return ELITE_MONTHLY_ADDON_GBP;
  if (isPremiumPlan(plan.name)) return PREMIUM_MONTHLY_ADDON_GBP;
  return 0;
}

export function planPriceForGarden(plan: SubscriptionPlan, gardenSize: GardenSize): number {
  const monthly = GARDEN_SIZE_MONTHLY_PRICE_GBP[gardenSize] + tierMonthlyAddon(plan);
  return isAnnualPlan(plan) ? monthly * ANNUAL_MONTHS_CHARGED : monthly;
}

export function formatPlanPrice(plan: SubscriptionPlan, gardenSize: GardenSize = "Small") {
  const price = planPriceForGarden(plan, gardenSize);
  const period = isAnnualPlan(plan) ? "year" : "month";
  return { price, label: `From £${formatGbp(price)}/${period}` };
}

export function formatPriceFrom(price: number, period: "month" | "year" | "mo" | "yr") {
  return `From £${formatGbp(price)}/${period}`;
}

export function planFeatures(plan: SubscriptionPlan): string[] {
  if (isElitePlan(plan.name)) return ELITE_FEATURES;
  if (isPremiumPlan(plan.name)) return PREMIUM_FEATURES;
  return ESSENTIAL_FEATURES;
}

export function planTierLabel(plan: SubscriptionPlan) {
  if (isElitePlan(plan.name)) return "Elite";
  if (isPremiumPlan(plan.name)) return "Premium";
  return "Essential";
}

export function planVisitsPerYear(plan: SubscriptionPlan): number {
  if (isElitePlan(plan.name)) return 30;
  if (isPremiumPlan(plan.name)) return 20;
  return 10;
}

export function planVisitSummary(plan: SubscriptionPlan) {
  const visits = planVisitsPerYear(plan);
  return `${visits} visits per year`;
}

function findTierPlan(basePlans: SubscriptionPlan[], tier: PlanTier, billing: BillingChoice) {
  return basePlans.find((p) => {
    if (p.billingInterval !== billing) return false;
    const name = p.name.toLowerCase();
    if (tier === "elite") return name.includes("elite");
    if (tier === "premium") return name.includes("premium");
    return !name.includes("premium") && !name.includes("elite");
  });
}

export function findTierPlanForBilling(
  basePlans: SubscriptionPlan[],
  tier: PlanTier,
  billing: BillingChoice
) {
  return findTierPlan(basePlans, tier, billing);
}

/** Monthly prices for the pricing matrix (small-garden base from API). */
export function monthlyPriceMatrix(basePlans: SubscriptionPlan[]) {
  const essential = findTierPlan(basePlans, "essential", "Monthly");
  const premium = findTierPlan(basePlans, "premium", "Monthly");
  const elite = findTierPlan(basePlans, "elite", "Monthly");
  if (!essential || !premium || !elite) return null;

  return GARDEN_SIZE_ORDER.map((size) => ({
    size,
    essential: planPriceForGarden(essential, size),
    premium: planPriceForGarden(premium, size),
    elite: planPriceForGarden(elite, size),
  }));
}

export function nextUpgradePlanLabel(planName: string, billingInterval: string): string | null {
  const annual = billingInterval === "Annual";
  const name = planName.toLowerCase();
  if (name.includes("elite")) return null;
  if (name.includes("premium")) {
    return annual ? "Elite Annual (£1,199.90/year)" : "Elite Monthly (£119.99/month)";
  }
  return annual ? "Premium Annual (£849.90/year)" : "Premium Monthly (£84.99/month)";
}
