import type { GardenSize, SubscriptionPlan } from "@/lib/api";
import { formatGbp } from "@/lib/format";

/** Annual checkout ≈ 10× monthly (~two months free). Mirrors `GardenSizePricing` in the API. */
export const ANNUAL_MONTHS_CHARGED = 10;

/** Monthly uplift on garden-band base price (matches GardenSizePricing). */
export const PREMIUM_MONTHLY_ADDON_GBP = 25;
export const ELITE_MONTHLY_ADDON_GBP = 60;

/** DB plan name for new signups (marketing: "Garden care"). */
export const SIGNUP_MONTHLY_PLAN_NAME = "Essential Monthly";

/** Lawn, beds, and edges we maintain - not whole-plot area or large paved zones. */
export const GARDEN_SIZE_MAINTAINED_AREA_NOTE =
  "Lawn, planted beds, and edges we cut and tidy on each visit - not your whole plot, large paving, or areas out of scope.";

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
    examples: "Up to 50 m² maintained - about 1 hour per visit.",
  },
  Medium: {
    shortName: "Medium",
    label: "Up to 100 m²",
    maxSqm: 100,
    visitHours: 1.5,
    monthlyPrice: 79.99,
    providerPerVisit: 30,
    description: "Typical suburban rear garden.",
    examples: "Up to 100 m² maintained - about 1.5 hours per visit.",
  },
  Large: {
    shortName: "Large",
    label: "Up to 150 m²",
    maxSqm: 150,
    visitHours: 2,
    monthlyPrice: 99.99,
    providerPerVisit: 40,
    description: "Larger family garden or generous plot.",
    examples: "Up to 150 m² maintained - about 2 hours per visit.",
  },
};

export function gardenSizeSelectLabel(size: GardenSize): string {
  const g = GARDEN_SIZE_GUIDE[size];
  return `${g.shortName} - ${g.label} maintained`;
}

/** Core maintenance on every garden care visit. */
export const CORE_VISIT_WORK = [
  "Lawn mowing and edging",
  "Weeding in borders and planted beds",
  "General garden clean-up and tidy",
  "Light watering of pots, beds & obvious dry spots while on site",
] as const;

export const GARDEN_CARE_FEATURES = [
  "10 visits per year, about every 5–6 weeks",
  ...CORE_VISIT_WORK,
  "Optional add-ons at signup: hedges, seasonal tidy, patio",
  "Reschedule or cancel visits in your account",
  "Customer support when you need help",
];

/** @deprecated Use GARDEN_CARE_FEATURES */
export const ESSENTIAL_FEATURES = GARDEN_CARE_FEATURES;

export const PREMIUM_FEATURES = [
  "Everything in Essential",
  "20 visits per year",
  "Light hedge trim and shaping (where accessible)",
  "Seasonal tidy - leaf blow/clear in garden, light pruning",
  "Priority scheduling where possible",
];

export const ELITE_FEATURES = [
  "Everything in Premium",
  "30 visits per year",
  "First-choice visit windows when booking",
  "Ideal for fast-growing lawns and high-use gardens",
  "Consistent upkeep through peak growing season",
];

export const ON_VISIT_WHEN_POSSIBLE = [
  "Light sweep of patio or paths beside the garden",
  "Light leaf work in the maintained area while we're there",
];

export const SEASONAL_ADDONS = [
  "Thorough patio and deck cleaning",
  "Large leaf clearances",
  "Gutter clearing - quoted separately",
];

/** Shown at signup, pricing, and linked from terms - customer must prepare the garden. */
export const CUSTOMER_VISIT_RESPONSIBILITIES = [
  "Easy access - gate unlocked, path clear, pets kept away from the garden",
  "Lawn and beds clear - no furniture, toys, tools, or branches in the way",
  "Pet waste picked up in the areas we maintain",
  "Working outdoor tap",
  "Power socket we can reach from the garden - indoor or outdoor is fine",
  "Grass clippings - you bin them, or leave your council garden-waste bin out on collection day",
] as const;

/** Shown under the responsibility list on signup and pricing. */
export const CUSTOMER_VISIT_GARDENER_BRINGS =
  "We bring a hose or watering can and a 20-metre extension lead.";

/** One-line summary for FAQs and short copy. */
export const CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY =
  "Clear access and the lawn, a working tap and power socket, and deal with clippings or your garden-waste bin.";

export const NOT_INCLUDED = [
  "Hauling green waste away unless you leave a garden-waste bin we can use",
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

/** @deprecated Launch offers one plan; tiers may return later. */
export const PLAN_TIERS: { id: PlanTier; label: string; tagline: string }[] = [
  { id: "essential", label: "Garden care", tagline: "10 visits a year" },
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
  /** Only used for visit-frequency options (plan tier). */
  minTier: PlanTier;
  group: SignupServiceGroup;
};

/** Services shown during signup - selections drive automatic plan matching. */
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
    description: "Light hedge work on a fixed schedule, not every maintenance visit.",
    minTier: "essential",
    group: "addons",
  },
  {
    id: "seasonal",
    label: "Seasonal tidy & leaf clearance",
    description: "Garden tidy and leaf clearance when the season needs it.",
    minTier: "essential",
    group: "addons",
  },
  {
    id: "patio",
    label: "Patio & path refresh",
    description: "Thorough patio and path clean with appropriate equipment.",
    minTier: "essential",
    group: "addons",
  },
  {
    id: "monthly",
    label: "10 / year",
    description: "About every 5–6 weeks",
    minTier: "essential",
    group: "visit-frequency",
  },
  {
    id: "fortnightly",
    label: "20 / year",
    description: "About every 2 weeks",
    minTier: "premium",
    group: "visit-frequency",
  },
  {
    id: "weekly",
    label: "30 / year",
    description: "Weekly in growing season",
    minTier: "elite",
    group: "visit-frequency",
  },
];

/** Customer £ per on-site hour at each garden band (matches SignupAddonPricing). */
export const SIGNUP_ADDON_CUSTOMER_PER_HOUR_GBP: Record<GardenSize, number> = {
  Small: 25,
  Medium: 37.5,
  Large: 50,
};

export const SIGNUP_ADDON_OCCURRENCES_PER_YEAR: Record<Exclude<SignupServiceId, "lawn-borders" | "monthly" | "fortnightly" | "weekly">, number> = {
  hedges: 4,
  seasonal: 4,
  patio: 2,
};

export function isSignupAddon(id: SignupServiceId): boolean {
  return SIGNUP_ADDON_SERVICE_IDS.includes(id);
}

export function signupAddonOccurrencesPerYear(addonId: SignupServiceId): number {
  if (addonId === "patio") return 2;
  if (addonId === "hedges" || addonId === "seasonal") return 4;
  return 0;
}

export function signupAddonCustomerPerOccurrenceGbp(gardenSize: GardenSize): number {
  const hours =
    gardenSize === "Large" ? 2 : gardenSize === "Medium" ? 1.5 : 1;
  return SIGNUP_ADDON_CUSTOMER_PER_HOUR_GBP[gardenSize] * hours;
}

/** Monthly subscription uplift for one add-on (full scheduled sessions, all tiers). */
export function signupAddonMonthlyCustomerGbp(gardenSize: GardenSize, addonId: SignupServiceId): number {
  const annual = signupAddonCustomerPerOccurrenceGbp(gardenSize) * signupAddonOccurrencesPerYear(addonId);
  return Math.round((annual / 12) * 100) / 100;
}

export function signupAddonsMonthlyTotalGbp(gardenSize: GardenSize, selected: SignupServiceId[]): number {
  const total = selected
    .filter(isSignupAddon)
    .reduce((sum, id) => sum + signupAddonMonthlyCustomerGbp(gardenSize, id), 0);
  return Math.round(total * 100) / 100;
}

export function countSignupAddons(selected: SignupServiceId[]): number {
  return selected.filter(isSignupAddon).length;
}

export const MONTHLY_MINIMUM_TERM_WITH_ADDONS_MONTHS = 6;

/** Minimum commitment months shown at signup (6 for monthly + add-ons, else plan default). */
export function effectiveMinimumTermMonths(
  plan: { billingInterval: string; minimumTermMonths: number },
  selectedAddons: SignupServiceId[]
): number {
  if (plan.billingInterval === "Annual") return plan.minimumTermMonths;
  if (countSignupAddons(selectedAddons) > 0) return MONTHLY_MINIMUM_TERM_WITH_ADDONS_MONTHS;
  return plan.minimumTermMonths;
}

export const SIGNUP_ADDON_COMMITMENT_NOTE =
  "Add-ons need a 6-month minimum on monthly billing. Annual billing stays 12 months.";

/** Shown on signup add-on checkboxes - frequency only, no line-item price. */
export function formatSignupAddonOccurrencesLabel(addonId: SignupServiceId): string {
  const occ = signupAddonOccurrencesPerYear(addonId);
  if (occ <= 0) return "";
  return occ === 1 ? "1× per year" : `${occ}× per year`;
}

export const SIGNUP_SERVICE_GROUP_LABELS: Record<SignupServiceGroup, string> = {
  core: "Included on every visit",
  addons: "Add-on services",
  "visit-frequency": "Visit frequency",
};

/** Optional extras on signup step 2 (core maintenance is always included). */
export const SIGNUP_ADDON_SERVICE_IDS: SignupServiceId[] = ["hedges", "seasonal", "patio"];

export const SIGNUP_VISIT_FREQUENCY_IDS: SignupServiceId[] = ["monthly", "fortnightly", "weekly"];

export const DEFAULT_VISIT_FREQUENCY: SignupServiceId = "monthly";

export function isVisitFrequencyService(id: SignupServiceId): boolean {
  return SIGNUP_VISIT_FREQUENCY_IDS.includes(id);
}

export function isVisitFrequencyOfferedAtSignup(id: SignupServiceId): boolean {
  return isVisitFrequencyService(id);
}

export function signupVisitFrequencyOptions(): SignupServiceOption[] {
  return SIGNUP_VISIT_FREQUENCY_IDS.map((id) => SIGNUP_SERVICES.find((s) => s.id === id)).filter(
    (s): s is SignupServiceOption => s != null
  );
}

export function visitsPerYearFromFrequency(id: SignupServiceId): number {
  if (id === "weekly") return 30;
  if (id === "fortnightly") return 20;
  return 10;
}

/** Checkbox groups on signup step 2. */
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

/** Plan tier is driven only by visit frequency - add-ons add cost, not tier. */
export function matchPlanTierFromVisitFrequency(visitFrequency: SignupServiceId): PlanTier {
  if (visitFrequency === "weekly") return "elite";
  if (visitFrequency === "fortnightly") return "premium";
  return "essential";
}

/** @deprecated Use matchPlanTierFromVisitFrequency */
export function matchPlanTierFromServices(selected: SignupServiceId[]): PlanTier {
  const freq = selected.find(isVisitFrequencyService);
  return matchPlanTierFromVisitFrequency(freq ?? "monthly");
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

function planTierMonthlyAddonGbp(plan: SubscriptionPlan): number {
  const name = plan.name.toLowerCase();
  if (name.includes("elite")) return ELITE_MONTHLY_ADDON_GBP;
  if (name.includes("premium")) return PREMIUM_MONTHLY_ADDON_GBP;
  return 0;
}

export function planPriceForGarden(
  plan: SubscriptionPlan,
  gardenSize: GardenSize,
  selectedAddons: SignupServiceId[] = []
): number {
  const monthly =
    GARDEN_SIZE_MONTHLY_PRICE_GBP[gardenSize] +
    planTierMonthlyAddonGbp(plan) +
    signupAddonsMonthlyTotalGbp(gardenSize, selectedAddons);
  return isAnnualPlan(plan) ? monthly * ANNUAL_MONTHS_CHARGED : monthly;
}

export function findSignupMonthlyPlanForFrequency(
  plans: SubscriptionPlan[],
  visitFrequency: SignupServiceId = DEFAULT_VISIT_FREQUENCY
): SubscriptionPlan | undefined {
  return findTierPlanForBilling(plans, matchPlanTierFromVisitFrequency(visitFrequency), "Monthly");
}

export function findSignupMonthlyPlan(plans: SubscriptionPlan[]): SubscriptionPlan | undefined {
  return findSignupMonthlyPlanForFrequency(plans, DEFAULT_VISIT_FREQUENCY);
}

export function formatPlanPrice(plan: SubscriptionPlan, gardenSize: GardenSize = "Small") {
  const price = planPriceForGarden(plan, gardenSize);
  const period = isAnnualPlan(plan) ? "year" : "month";
  return { price, label: `From £${formatGbp(price)}/${period}` };
}

export function formatPriceFrom(price: number, period: "month" | "year" | "mo" | "yr") {
  return `From £${formatGbp(price)}/${period}`;
}

/** Personalised signup quote — exact price for garden size and add-ons. */
export function formatQuotedPrice(price: number, period: "month" | "year" | "mo" | "yr") {
  return `£${formatGbp(price)}/${period}`;
}

export function planFeatures(_plan?: SubscriptionPlan): string[] {
  return GARDEN_CARE_FEATURES;
}

export function planTierLabel(_plan?: SubscriptionPlan) {
  return "Garden care";
}

export function planVisitsPerYear(plan?: SubscriptionPlan): number {
  if (!plan) return 10;
  const name = plan.name.toLowerCase();
  if (name.includes("elite")) return 30;
  if (name.includes("premium")) return 20;
  return 10;
}

export function planVisitSummary(plan: SubscriptionPlan, visitFrequency?: SignupServiceId) {
  const visits = visitFrequency
    ? visitsPerYearFromFrequency(visitFrequency)
    : planVisitsPerYear(plan);
  return `${visits} visits per year`;
}

/** Lines for the signup quote card - visit cadence, core work, and selected add-ons. */
export function signupQuoteIncludedLines(
  visitFrequency: SignupServiceId,
  selectedAddonIds: SignupServiceId[]
): string[] {
  const lines: string[] = [];
  const freq = SIGNUP_SERVICES.find((s) => s.id === visitFrequency);
  const visits = visitsPerYearFromFrequency(visitFrequency);
  lines.push(
    freq
      ? `${visits} visits per year (${freq.description.toLowerCase()})`
      : `${visits} visits per year`
  );
  lines.push(...CORE_VISIT_WORK);
  for (const id of selectedAddonIds.filter(isSignupAddon)) {
    const svc = SIGNUP_SERVICES.find((s) => s.id === id);
    if (!svc) continue;
    const occ = formatSignupAddonOccurrencesLabel(id);
    lines.push(occ ? `${svc.label} (${occ})` : svc.label);
  }
  return lines;
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
export function gardenSizeMonthlyPriceMatrix() {
  return GARDEN_SIZE_ORDER.map((size) => ({
    size,
    monthly: GARDEN_SIZE_MONTHLY_PRICE_GBP[size],
    guide: GARDEN_SIZE_GUIDE[size],
  }));
}

/** @deprecated Launch has no in-app tier upgrades. */
export function nextUpgradePlanLabel(_planName: string, _billingInterval: string): string | null {
  return null;
}
