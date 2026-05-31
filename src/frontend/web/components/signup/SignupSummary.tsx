import type { GardenSize, SubscriptionPlan } from "@/lib/api";
import type { SignupServiceId } from "@/lib/consumer-plans";
import {
  countSignupAddons,
  effectiveMinimumTermMonths,
  formatPriceFrom,
  GARDEN_SIZE_GUIDE,
  planPriceForGarden,
  planVisitSummary,
  SIGNUP_ADDON_COMMITMENT_NOTE,
} from "@/lib/consumer-plans";

export function SignupSummary({
  plan,
  gardenSize,
  selectedAddons = [],
  compact = false,
  showPrice = true,
}: {
  plan: SubscriptionPlan;
  gardenSize: GardenSize;
  selectedAddons?: SignupServiceId[];
  compact?: boolean;
  showPrice?: boolean;
}) {
  const addonCount = countSignupAddons(selectedAddons);
  const minimumTermMonths = effectiveMinimumTermMonths(plan, selectedAddons);
  const price = planPriceForGarden(plan, gardenSize, selectedAddons);
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
      {showPrice && addonCount > 0 && (
        <p className="mt-2 text-xs text-stone-600">
          Includes {addonCount} add-on{addonCount === 1 ? "" : "s"} · {SIGNUP_ADDON_COMMITMENT_NOTE}
        </p>
      )}
      {showPrice && (
        <>
          <p className={`font-bold text-gardens-primary ${compact ? "mt-2 text-xl" : "mt-3 text-2xl"}`}>
            {formatPriceFrom(price, period === "year" ? "yr" : "mo")}
          </p>
          {!compact && (
            <p className="mt-2 text-xs text-stone-500">
              {minimumTermMonths}-month minimum term · Cancel via support after minimum term
            </p>
          )}
        </>
      )}
    </div>
  );
}
