"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { api, type SubscriptionPlan } from "@/lib/api";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";
import {
  monthlyPriceMatrix,
  NOT_INCLUDED,
  ON_VISIT_WHEN_POSSIBLE,
  planFeatures,
  planPriceForGarden,
  planTierLabel,
  planVisitSummary,
  SEASONAL_ADDONS,
  SHARED_FEATURES,
} from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";

export function PricingSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    api.getPlans()
      .then((p) => {
        setPlans(sortPlans(p));
        setOffline(false);
      })
      .catch(() => {
        setPlans(FALLBACK_PLANS);
        setOffline(true);
      })
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl border bg-white p-8 shadow-soft">
            <div className="h-6 w-32 rounded bg-stone-200" />
            <div className="mt-4 h-10 w-24 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    );
  }

  const displayPlans = sortPlans(plans);
  const matrix = monthlyPriceMatrix(displayPlans);

  return (
    <div className="space-y-8">
      {offline && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Showing standard pricing — live plan details will load when the API is connected.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {displayPlans.map((plan, index) => {
          const isAnnual = plan.billingInterval !== "Monthly";
          const features = planFeatures(plan);
          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border bg-white p-6 shadow-soft sm:p-8 ${
                isAnnual ? "border-gardens-primary ring-2 ring-gardens-primary/20" : "border-stone-200"
              }`}
            >
              {isAnnual && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gardens-accent px-4 py-1 text-xs font-semibold text-gardens-dark">
                  Best value
                </span>
              )}
              <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
                {planTierLabel(plan)}
              </p>
              <h3 className="font-display text-xl font-semibold text-gardens-dark">{plan.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{planVisitSummary(plan)}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-gardens-primary">
                  £{formatGbp(planPriceForGarden(plan, "Small"))}
                </span>
                <span className="text-stone-500">/{isAnnual ? "year" : "month"}</span>
              </div>
              <p className="mt-1 text-xs text-stone-500">Small garden — see table below for medium &amp; large</p>
              <p className="mt-2 text-xs text-stone-500">{plan.minimumTermMonths}-month minimum term</p>
              <ul className="mt-6 space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-gardens-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={`/signup?plan=${index}`}
                className={`mt-8 block w-full min-h-[48px] rounded-full py-3 text-center text-base font-semibold leading-[48px] sm:text-sm sm:leading-normal sm:py-3 ${
                  isAnnual
                    ? "bg-gardens-primary text-white hover:bg-gardens-dark"
                    : "border border-gardens-primary text-gardens-primary hover:bg-gardens-light"
                }`}
              >
                Choose {plan.name}
              </Link>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-600">
        {SHARED_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-gardens-primary" />
            {f}
          </li>
        ))}
      </ul>

      {matrix && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
          <h3 className="font-display text-lg font-semibold text-gardens-dark">
            Monthly price by garden size
          </h3>
          <p className="mt-1 text-sm text-stone-600">
            Prices scale with the amount of garden we maintain. Choose your size at signup — we&apos;ll confirm it
            matches your property.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-stone-500">
                  <th className="py-2 pr-4 font-medium">Garden size</th>
                  <th className="py-2 px-4 font-medium">Essential</th>
                  <th className="py-2 pl-4 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.size} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-gardens-dark">{row.size}</td>
                    <td className="py-3 px-4 text-stone-700">£{formatGbp(row.essential)}/mo</td>
                    <td className="py-3 pl-4 text-stone-700">£{formatGbp(row.premium)}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Annual plans save roughly two months — add £100/£200 per year for medium/large gardens (same uplift as
            monthly).
          </p>
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-gardens-dark">On visit vs seasonal add-ons</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gardens-dark">Included while we&apos;re there (tap/hose for watering)</p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              {ON_VISIT_WHEN_POSSIBLE.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gardens-dark">Optional extras — ask for a quote</p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              {SEASONAL_ADDONS.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Not in the subscription: {NOT_INCLUDED.slice(0, 3).join("; ")} —{" "}
          <a href="/#faq" className="text-gardens-primary hover:underline">see FAQs</a>.
        </p>
      </div>
    </div>
  );
}
