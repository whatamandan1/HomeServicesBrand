import type { SubscriptionPlan } from "@/lib/api";

/** Shown when live plan API is unavailable (matches seeded backend plans). */
export const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "fallback-monthly",
    name: "Essential Monthly",
    description: "Weekly garden maintenance, 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 29.95,
  },
  {
    id: "fallback-annual",
    name: "Essential Annual",
    description: "Weekly garden maintenance, 12-month commitment, discounted.",
    billingInterval: "Annual",
    minimumTermMonths: 12,
    priceGbp: 299.95,
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
