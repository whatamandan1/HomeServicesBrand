import type { SubscriptionPlan } from "@/lib/api";
import { findTierPlanForBilling, type BillingChoice, type PlanTier } from "@/lib/consumer-plans";

/** Shown when live plan API is unavailable (matches seeded backend plans). */
export const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "fallback-essential-monthly",
    name: "Essential Monthly",
    description: "One visit per month (small garden) — lawn, borders, and tidy. 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 39.95,
  },
  {
    id: "fallback-premium-monthly",
    name: "Premium Monthly",
    description: "Two visits per month (small garden) — hedges, beds, seasonal tidy. 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 64.95,
  },
  {
    id: "fallback-elite-monthly",
    name: "Elite Monthly",
    description: "Three visits per month (~every 10 days, small garden) — everything in Premium. 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 99.95,
  },
  {
    id: "fallback-essential-annual",
    name: "Essential Annual",
    description: "One visit per month (small garden), 12-month commitment — discounted.",
    billingInterval: "Annual",
    minimumTermMonths: 12,
    priceGbp: 399.95,
  },
  {
    id: "fallback-premium-annual",
    name: "Premium Annual",
    description: "Two visits per month (small garden), 12-month commitment — discounted.",
    billingInterval: "Annual",
    minimumTermMonths: 12,
    priceGbp: 559.95,
  },
  {
    id: "fallback-elite-annual",
    name: "Elite Annual",
    description: "Three visits per month (~every 10 days, small garden), 12-month commitment — discounted.",
    billingInterval: "Annual",
    minimumTermMonths: 12,
    priceGbp: 909.95,
  },
];

export function sortPlans(plans: SubscriptionPlan[]): SubscriptionPlan[] {
  return [...plans].sort((a, b) => {
    const aMonthly = a.billingInterval === "Monthly" ? 0 : 1;
    const bMonthly = b.billingInterval === "Monthly" ? 0 : 1;
    return aMonthly - bMonthly || a.priceGbp - b.priceGbp;
  });
}

export function planSignupIndex(plans: SubscriptionPlan[], planId: string): number {
  const sorted = sortPlans(plans);
  const idx = sorted.findIndex((p) => p.id === planId);
  return idx >= 0 ? idx : 0;
}

export function planSignupHref(
  plans: SubscriptionPlan[],
  tier: PlanTier,
  _billing?: BillingChoice
): string {
  const plan = findTierPlanForBilling(plans, tier, "Annual");
  if (!plan) return "/signup";
  return `/signup?plan=${planSignupIndex(plans, plan.id)}`;
}

/** @deprecated Use nextUpgradePlanLabel from consumer-plans */
export function premiumPlanLabel(billingInterval: string) {
  return billingInterval === "Annual" ? "Premium Annual (£559.95/year)" : "Premium Monthly (£64.95/month)";
}
