import type { SubscriptionPlan } from "@/lib/api";
import type { PlanTier } from "@/lib/consumer-plans";

export function tierFromPlanName(name: string): PlanTier {
  const n = name.toLowerCase();
  if (n.includes("elite")) return "elite";
  if (n.includes("premium")) return "premium";
  return "essential";
}

export function tierFromPlan(plan: SubscriptionPlan): PlanTier {
  return tierFromPlanName(plan.name);
}

/** Format and validate UK postcodes for signup. */
export function normalizeUkPostcode(value: string): string {
  const compact = value.trim().replace(/\s+/g, "").toUpperCase();
  if (compact.length <= 3) return compact;
  return `${compact.slice(0, -3)} ${compact.slice(-3)}`.trim();
}

export function isValidUkPostcode(value: string): boolean {
  return /^[A-Z]{1,2}\d[A-Z\d]?\s\d[A-Z]{2}$/i.test(normalizeUkPostcode(value));
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export const AVAILABILITY_PRESETS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Evenings",
  "Weekends",
  "Flexible - contact me to arrange",
] as const;

export const MIN_PASSWORD_LENGTH = 8;
