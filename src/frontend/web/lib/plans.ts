import type { SubscriptionPlan } from "@/lib/api";
import { SIGNUP_MONTHLY_PLAN_NAME } from "@/lib/consumer-plans";

/** Shown when live plan API is unavailable (matches seeded backend plans). */
export const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "fallback-essential-monthly",
    name: SIGNUP_MONTHLY_PLAN_NAME,
    description: "Garden care - 10 visits/year. Price by garden size. 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 59.99,
  },
  {
    id: "fallback-premium-monthly",
    name: "Premium Monthly",
    description: "Garden care - 20 visits/year. Price by garden size. 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 84.99,
  },
  {
    id: "fallback-elite-monthly",
    name: "Elite Monthly",
    description: "Garden care - 30 visits/year. Price by garden size. 3-month minimum.",
    billingInterval: "Monthly",
    minimumTermMonths: 3,
    priceGbp: 119.99,
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

export function planSignupHref(_plans?: SubscriptionPlan[]): string {
  return "/signup";
}

/** @deprecated Use nextUpgradePlanLabel from consumer-plans */
export function premiumPlanLabel(_billingInterval: string) {
  return null;
}
