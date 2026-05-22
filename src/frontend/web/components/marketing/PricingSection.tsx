"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { api, type SubscriptionPlan } from "@/lib/api";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";

const features = [
  "Recurring visits on your schedule",
  "Vetted local gardeners",
  "Manage everything in your account",
  "Help when you need it",
];

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

  return (
    <div className="space-y-4">
      {offline && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Showing standard pricing — live plan details will load when the API is connected.
        </p>
      )}
      <div className="grid gap-6 md:grid-cols-2">
        {displayPlans.map((plan, index) => {
          const isAnnual = plan.billingInterval !== "Monthly";
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
              <h3 className="font-display text-xl font-semibold text-gardens-dark">{plan.name}</h3>
              <p className="mt-2 text-sm text-stone-600">{plan.description}</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold text-gardens-primary">£{plan.priceGbp}</span>
                <span className="text-stone-500">/{isAnnual ? "year" : "month"}</span>
              </div>
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
    </div>
  );
}
