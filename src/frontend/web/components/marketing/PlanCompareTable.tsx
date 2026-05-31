"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";
import type { SubscriptionPlan } from "@/lib/api";
import {
  findTierPlanForBilling,
  PLAN_COMPARE_ROWS,
  PLAN_TIERS,
  planPriceForGarden,
  type PlanTier,
} from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";
import { planSignupHref } from "@/lib/plans";

type PlanCompareTableProps = {
  plans: SubscriptionPlan[];
};

function CompareCell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-gardens-dark">{value}</span>;
  }
  if (value) {
    return (
      <span className="inline-flex items-center gap-1 text-sm text-gardens-primary">
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  return (
    <span className="inline-flex text-stone-300" aria-label="Not included">
      <Minus className="h-4 w-4" />
    </span>
  );
}

export function PlanCompareTable({ plans }: PlanCompareTableProps) {
  const tierPlans = PLAN_TIERS.map((tier) => ({
    ...tier,
    plan: findTierPlanForBilling(plans, tier.id, "Monthly"),
  }));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-soft overflow-hidden">
      <div className="border-b border-stone-100 bg-gardens-light/30 px-4 py-5 sm:px-6">
        <h3 className="font-display text-lg font-semibold text-gardens-dark">Compare plans</h3>
        <p className="mt-1 text-sm text-stone-600">All prices shown are monthly billing.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="w-[40%] py-4 pl-4 pr-3 font-medium text-stone-500 sm:pl-6">What you get</th>
              {tierPlans.map(({ id, label, tagline, plan }) => (
                <th key={id} className="px-3 py-4 text-center align-top">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">{label}</p>
                  <p className="mt-1 text-xs font-normal text-stone-500">{tagline}</p>
                  {plan && (
                    <p className="mt-3 font-display text-2xl font-bold text-gardens-dark">
                      <span className="text-sm font-normal text-stone-500">From </span>
                      £{formatGbp(planPriceForGarden(plan, "Small"))}
                      <span className="text-sm font-normal text-stone-500">/mo</span>
                    </p>
                  )}
                  {plan && (
                    <Link
                      href={planSignupHref(plans, id as PlanTier)}
                      className={`mt-3 inline-block rounded-full px-4 py-2 text-xs font-semibold ${
                        id === "premium"
                          ? "bg-gardens-primary text-white hover:bg-gardens-dark"
                          : "border border-gardens-primary text-gardens-primary hover:bg-gardens-light"
                      }`}
                    >
                      Choose {label}
                    </Link>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLAN_COMPARE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-stone-50 last:border-0">
                <td className="py-3 pl-4 pr-3 text-stone-700 sm:pl-6">{row.label}</td>
                <td className="px-3 py-3 text-center">
                  <CompareCell value={row.essential} />
                </td>
                <td className="px-3 py-3 text-center">
                  <CompareCell value={row.premium} />
                </td>
                <td className="px-3 py-3 text-center">
                  <CompareCell value={row.elite} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
