import type { GardenSize, SubscriptionPlan } from "@/lib/api";
import { formatGbp } from "@/lib/format";

export const GARDEN_SIZE_UPLIFT = {
  monthly: { Medium: 10, Large: 20 } as const,
  annual: { Medium: 100, Large: 200 } as const,
};

export const GARDEN_SIZE_GUIDE: Record<
  GardenSize,
  { label: string; description: string; examples: string }
> = {
  Small: {
    label: "75 m²",
    description: "Courtyard, terrace, or compact town garden.",
    examples: "Typical courtyard, terrace, or compact town garden.",
  },
  Medium: {
    label: "150 m²",
    description: "Typical suburban rear garden with lawn and beds.",
    examples: "Typical suburban rear garden with lawn and planting beds.",
  },
  Large: {
    label: "150+ m²",
    description: "Generous lawns, long borders, or multiple zones.",
    examples: "Generous lawns, long borders, or multiple garden zones.",
  },
};

export const ESSENTIAL_FEATURES = [
  "10 professional visits per year",
  "Lawn mowing and edging",
  "Light border and bed tidy",
  "Grass clippings removed from site",
  "Light watering of pots & beds while on site (tap/hose permitting)",
  "Reschedule or cancel visits in your account",
  "Customer support when you need help",
];

export const PREMIUM_FEATURES = [
  "Everything in Essential",
  "20 visits per year (about every 2 weeks)",
  "Light hedge trim and shaping (where accessible)",
  "Weeding in planted beds",
  "Seasonal tidy — leaf blow/clear in garden, light pruning",
  "Priority scheduling where possible",
];

export const ELITE_FEATURES = [
  "Everything in Premium",
  "30 visits per year (about every 10 days)",
  "Ideal for fast-growing lawns and high-use gardens",
  "Consistent upkeep through peak growing season",
  "First choice for scheduling windows where possible",
];

export const ON_VISIT_WHEN_POSSIBLE = [
  "Watering pots, containers, and obvious dry spots (outdoor tap and hose needed)",
  "Light sweep of garden-adjacent patio or paths (not a deep clean)",
  "Autumn leaf blow and clear within the maintained garden area (Premium & Elite visits)",
];

export const SEASONAL_ADDONS = [
  "Thorough patio and deck cleaning",
  "Dedicated leaf clearance (large volumes or whole-property)",
  "Gutter clearing (quoted separately — access and height assessed)",
];

export const NOT_INCLUDED = [
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

export type PlanCompareRow = {
  label: string;
  essential: boolean | string;
  premium: boolean | string;
  elite: boolean | string;
};

/** Side-by-side feature matrix for Essential / Premium / Elite. */
export const PLAN_COMPARE_ROWS: PlanCompareRow[] = [
  { label: "Visits included", essential: "10 / year", premium: "20 / year", elite: "30 / year" },
  { label: "Lawn mowing & edging", essential: true, premium: true, elite: true },
  { label: "Border & bed tidy", essential: true, premium: true, elite: true },
  { label: "Clippings removed", essential: true, premium: true, elite: true },
  { label: "Light watering while on site", essential: true, premium: true, elite: true },
  { label: "Hedge trim & shaping", essential: false, premium: true, elite: true },
  { label: "Bed weeding", essential: false, premium: true, elite: true },
  { label: "Seasonal tidy & leaf blow", essential: false, premium: true, elite: true },
  { label: "Priority scheduling", essential: false, premium: true, elite: true },
  { label: "Reschedule in your account", essential: true, premium: true, elite: true },
];

export const PLAN_TIERS: { id: PlanTier; label: string; tagline: string }[] = [
  { id: "essential", label: "Essential", tagline: "Monthly upkeep" },
  { id: "premium", label: "Premium", tagline: "Twice-monthly + hedges" },
  { id: "elite", label: "Elite", tagline: "Most frequent visits" },
];

function isElitePlan(name: string) {
  return name.toLowerCase().includes("elite");
}

function isPremiumPlan(name: string) {
  return name.toLowerCase().includes("premium");
}

function isAnnualPlan(plan: SubscriptionPlan) {
  return plan.billingInterval !== "Monthly";
}

export function gardenSizeUplift(gardenSize: GardenSize, annual: boolean): number {
  if (gardenSize === "Small") return 0;
  const table = annual ? GARDEN_SIZE_UPLIFT.annual : GARDEN_SIZE_UPLIFT.monthly;
  return table[gardenSize];
}

export function planPriceForGarden(plan: SubscriptionPlan, gardenSize: GardenSize): number {
  return plan.priceGbp + gardenSizeUplift(gardenSize, isAnnualPlan(plan));
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
  if (visits === 30) return "30 visits per year";
  if (visits === 20) return "20 visits per year";
  return "10 visits per year";
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

  const sizes: GardenSize[] = ["Small", "Medium", "Large"];
  return sizes.map((size) => ({
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
    return annual ? "Elite Annual (£899.95/year)" : "Elite Monthly (£89.95/month)";
  }
  return annual ? "Premium Annual (£549.95/year)" : "Premium Monthly (£54.95/month)";
}
