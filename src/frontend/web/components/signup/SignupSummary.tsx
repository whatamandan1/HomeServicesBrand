import type { GardenSize, SubscriptionPlan } from "@/lib/api";
import { formatPriceFrom, GARDEN_SIZE_GUIDE, planPriceForGarden, planVisitSummary } from "@/lib/consumer-plans";

export function SignupSummary({
  plan,
  gardenSize,
  compact = false,
  showPrice = true,
}: {
  plan: SubscriptionPlan;
  gardenSize: GardenSize;
  compact?: boolean;
  showPrice?: boolean;
}) {
  const price = planPriceForGarden(plan, gardenSize);
  const period = plan.billingInterval === "Monthly" ? "month" : "year";

  return (
    <div
      className={`rounded-2xl border border-gardens-primary/20 bg-gardens-light/30 ${
        compact ? "px-4 py-3" : "p-5"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">Your plan</p>
      <p className={`font-semibold text-gardens-dark ${compact ? "text-base" : "mt-1 text-lg"}`}>
        {plan.name.replace(/ Monthly| Annual/, "")}
      </p>
      <p className="mt-1 text-sm text-stone-600">{planVisitSummary(plan)}</p>
      <p className="mt-2 text-sm text-stone-600">
        {GARDEN_SIZE_GUIDE[gardenSize].label} garden
        {showPrice ? ` · ${plan.billingInterval === "Monthly" ? "Monthly" : "Annual"} billing` : ""}
      </p>
      {showPrice && (
        <>
          <p className={`font-bold text-gardens-primary ${compact ? "mt-2 text-xl" : "mt-3 text-2xl"}`}>
            {formatPriceFrom(price, period === "year" ? "yr" : "mo")}
          </p>
          {!compact && (
            <p className="mt-2 text-xs text-stone-500">
              {plan.minimumTermMonths}-month minimum term · Cancel via support after minimum term
            </p>
          )}
        </>
      )}
    </div>
  );
}
