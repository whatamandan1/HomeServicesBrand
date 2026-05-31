"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { api, type SubscriptionPlan } from "@/lib/api";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";
import {
  formatPriceFrom,
  CUSTOMER_VISIT_RESPONSIBILITIES,
  GARDEN_CARE_FEATURES,
  GARDEN_SIZE_GUIDE,
  GARDEN_SIZE_ORDER,
  NOT_INCLUDED,
  ON_VISIT_WHEN_POSSIBLE,
  planPriceForGarden,
  SEASONAL_ADDONS,
  SHARED_FEATURES,
  findSignupMonthlyPlan,
} from "@/lib/consumer-plans";
import { PlanCompareTable } from "@/components/marketing/PlanCompareTable";

export function PricingSection() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    api
      .getPlans()
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
      <div className="space-y-8">
        <div className="animate-pulse rounded-2xl border bg-white p-8 shadow-soft h-64" />
        <div className="grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-white p-8 shadow-soft">
              <div className="h-6 w-32 rounded bg-stone-200" />
              <div className="mt-4 h-10 w-24 rounded bg-stone-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const signupPlan = findSignupMonthlyPlan(plans);

  return (
    <div className="space-y-8">
      {offline && (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          Showing standard pricing — live plan details will load when the API is connected.
        </p>
      )}

      <PlanCompareTable />

      <div>
        <p className="text-center text-sm font-medium text-stone-600">
          Monthly price by garden size — 10 visits per year included
        </p>
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          {GARDEN_SIZE_ORDER.map((size) => {
            const guide = GARDEN_SIZE_GUIDE[size];
            const price = signupPlan ? planPriceForGarden(signupPlan, size) : guide.monthlyPrice;
            return (
              <div
                key={size}
                className="relative rounded-2xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
                  {guide.shortName} garden
                </p>
                <h3 className="font-display text-xl font-semibold text-gardens-dark">{guide.label}</h3>
                <p className="mt-2 text-sm text-stone-600">{guide.examples}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-gardens-primary">
                    {formatPriceFrom(price, "month")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-stone-500">Billed monthly · 3-month minimum</p>
                <Link
                  href="/signup"
                  className="mt-8 block w-full min-h-[48px] rounded-full border border-gardens-primary py-3 text-center text-base font-semibold leading-[48px] text-gardens-primary hover:bg-gardens-light sm:text-sm sm:leading-normal sm:py-3"
                >
                  Get your quote
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-gardens-primary/20 bg-gardens-light/30 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">Every subscription</p>
        <ul className="mt-4 space-y-3">
          {GARDEN_CARE_FEATURES.slice(0, 6).map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-gardens-primary" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-stone-600">
        {SHARED_FEATURES.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-gardens-primary" />
            {f}
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-gardens-dark">Before each visit — your responsibility</h3>
        <ul className="mt-3 space-y-1.5 text-sm text-stone-700">
          {CUSTOMER_VISIT_RESPONSIBILITIES.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-stone-600">
          Full details in our{" "}
          <Link href="/terms" className="font-medium text-gardens-primary hover:underline">
            terms of service
          </Link>
          , including how visits must be booked through GardensSorted.
        </p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold text-gardens-dark">On visit vs optional add-ons</h3>
        <div className="mt-4 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gardens-dark">Also while we&apos;re there (not separate visits)</p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              {ON_VISIT_WHEN_POSSIBLE.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium text-gardens-dark">Optional at signup</p>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              {SEASONAL_ADDONS.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-xs text-stone-500">
          Not in the subscription: {NOT_INCLUDED.slice(0, 3).join("; ")} —{" "}
          <a href="/#faq" className="text-gardens-primary hover:underline">
            see FAQs
          </a>
          .
        </p>
      </div>
    </div>
  );
}
