"use client";

import Link from "next/link";
import { Check, Minus } from "lucide-react";
import { GARDEN_CARE_COMPARE_ROWS, GARDEN_SIZE_MONTHLY_PRICE_GBP } from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";

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

export function PlanCompareTable() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-soft overflow-hidden">
      <div className="border-b border-stone-100 bg-gardens-light/30 px-4 py-5 sm:px-6">
        <h3 className="font-display text-lg font-semibold text-gardens-dark">What&apos;s included</h3>
        <p className="mt-1 text-sm text-stone-600">
          Garden care subscription — from £{formatGbp(GARDEN_SIZE_MONTHLY_PRICE_GBP.Small)}/mo for a small garden.
          Add optional extras at signup.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[320px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="w-[55%] py-4 pl-4 pr-3 font-medium text-stone-500 sm:pl-6">Feature</th>
              <th className="px-3 py-4 text-center align-top">
                <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">Garden care</p>
                <p className="mt-1 text-xs font-normal text-stone-500">10 visits / year</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {GARDEN_CARE_COMPARE_ROWS.map((row) => (
              <tr key={row.label} className="border-b border-stone-50 last:border-0">
                <td className="py-3 pl-4 pr-3 text-stone-700 sm:pl-6">{row.label}</td>
                <td className="px-3 py-3 text-center">
                  <CompareCell value={row.value} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border-t border-stone-100 px-4 py-4 text-center sm:px-6">
        <Link
          href="/signup"
          className="inline-block rounded-full bg-gardens-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-gardens-dark"
        >
          Get your quote
        </Link>
      </div>
    </div>
  );
}
