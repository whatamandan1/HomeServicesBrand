"use client";

import { signupVisitFrequencyOptions, type SignupServiceId } from "@/lib/consumer-plans";

type SignupVisitFrequencyPickerProps = {
  value: SignupServiceId;
  onChange: (id: SignupServiceId) => void;
};

/** Visit count per year - stacked on mobile, segmented row from sm+. */
export function SignupVisitFrequencyPicker({ value, onChange }: SignupVisitFrequencyPickerProps) {
  const options = signupVisitFrequencyOptions();

  return (
    <fieldset>
      <legend className="text-sm font-medium text-stone-800">How often should we visit?</legend>
      <p className="mt-1 text-xs text-stone-500">Visits per year for your garden care plan.</p>
      <div
        className="mt-3 flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-1 sm:overflow-hidden sm:rounded-xl sm:border sm:border-stone-200 sm:bg-stone-100/80 sm:p-1"
        role="radiogroup"
        aria-label="Visit frequency"
      >
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              title={option.description}
              onClick={() => onChange(option.id)}
              className={`min-h-[48px] rounded-xl border px-3 py-3 text-left transition sm:rounded-lg sm:px-2 sm:py-2.5 sm:text-center ${
                selected
                  ? "border-gardens-primary bg-gardens-light/50 text-gardens-dark ring-2 ring-gardens-primary/30 sm:bg-white sm:shadow-sm sm:ring-1"
                  : "border-stone-200 bg-white text-stone-700 hover:border-gardens-primary/40 sm:border-transparent sm:bg-transparent sm:hover:bg-white/60"
              }`}
            >
              <span className="block text-sm font-semibold sm:text-sm">{option.label}</span>
              <span className="mt-0.5 block text-xs font-normal text-stone-500 sm:mt-0">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
