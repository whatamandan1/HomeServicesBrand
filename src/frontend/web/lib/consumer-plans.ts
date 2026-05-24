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
    label: "Small",
    description: "Up to about 100 m² of lawn and borders combined.",
    examples: "Typical courtyard, terrace, or compact town garden.",
  },
  Medium: {
    label: "Medium",
    description: "About 100–250 m² of maintained garden.",
    examples: "Typical suburban rear garden with lawn and planting beds.",
  },
  Large: {
    label: "Large",
    description: "Roughly 250 m²+ or extensive borders and planting.",
    examples: "Generous lawns, long borders, or multiple garden zones.",
  },
};

export const ESSENTIAL_FEATURES = [
  "1 professional visit every month",
  "Lawn mowing and edging",
  "Light border and bed tidy",
  "Grass clippings removed from site",
  "Light watering of pots & beds while on site (tap/hose permitting)",
  "Reschedule or cancel visits in your account",
  "Customer support when you need help",
];

export const PREMIUM_FEATURES = [
  "Everything in Essential",
  "2 visits every month (about every 2 weeks)",
  "Light hedge trim and shaping (where accessible)",
  "Weeding in planted beds",
  "Seasonal tidy — leaf blow/clear in garden, light pruning",
  "Priority scheduling where possible",
];

export const ON_VISIT_WHEN_POSSIBLE = [
  "Watering pots, containers, and obvious dry spots (outdoor tap and hose needed)",
  "Light sweep of garden-adjacent patio or paths (not a deep clean)",
  "Autumn leaf blow and clear within the maintained garden area (Premium visits)",
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
  return { price, label: `£${formatGbp(price)}/${period}` };
}

export function planFeatures(plan: SubscriptionPlan): string[] {
  return isPremiumPlan(plan.name) ? PREMIUM_FEATURES : ESSENTIAL_FEATURES;
}

export function planTierLabel(plan: SubscriptionPlan) {
  return isPremiumPlan(plan.name) ? "Premium" : "Essential";
}

export function planVisitSummary(plan: SubscriptionPlan) {
  return isPremiumPlan(plan.name) ? "2 visits per month" : "1 visit per month";
}

/** Monthly prices for the pricing matrix (small-garden base from API). */
export function monthlyPriceMatrix(basePlans: SubscriptionPlan[]) {
  const essential = basePlans.find(
    (p) => p.billingInterval === "Monthly" && !isPremiumPlan(p.name)
  );
  const premium = basePlans.find(
    (p) => p.billingInterval === "Monthly" && isPremiumPlan(p.name)
  );
  if (!essential || !premium) return null;

  const sizes: GardenSize[] = ["Small", "Medium", "Large"];
  return sizes.map((size) => ({
    size,
    essential: planPriceForGarden(essential, size),
    premium: planPriceForGarden(premium, size),
  }));
}
