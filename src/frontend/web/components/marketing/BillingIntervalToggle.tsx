"use client";

import {
  ANNUAL_BILLING_BADGE,
  ANNUAL_BILLING_SAVINGS,
  type BillingChoice,
} from "@/lib/consumer-plans";

type BillingIntervalToggleProps = {
  billing: BillingChoice;
  onChange: (billing: BillingChoice) => void;
  /** Show Annual before Monthly (recommended on pricing and signup). */
  annualFirst?: boolean;
  className?: string;
};

export function BillingIntervalToggle({
  billing,
  onChange,
  annualFirst = true,
  className = "",
}: BillingIntervalToggleProps) {
  const options: BillingChoice[] = annualFirst ? ["Annual", "Monthly"] : ["Monthly", "Annual"];

  return (
    <div
      className={`inline-flex rounded-full border border-stone-200 bg-white p-1 ${className}`}
      role="group"
      aria-label="Billing interval"
    >
      {options.map((option) => {
        const isAnnual = option === "Annual";
        const selected = billing === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selected ? "bg-gardens-primary text-white" : "text-stone-600 hover:text-gardens-dark"
            }`}
          >
            {option}
            {isAnnual && (
              <span
                className={`ml-1.5 text-xs font-semibold ${
                  selected ? "text-gardens-accent" : "text-gardens-primary"
                }`}
              >
                {ANNUAL_BILLING_BADGE} · {ANNUAL_BILLING_SAVINGS}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
