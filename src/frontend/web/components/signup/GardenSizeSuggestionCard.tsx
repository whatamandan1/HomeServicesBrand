"use client";

import type { GardenSize } from "@/lib/api";
import { GARDEN_SIZE_GUIDE, GARDEN_SIZE_ORDER } from "@/lib/consumer-plans";
import type { GardenSizeSuggestion } from "@/lib/api";

type GardenSizeSuggestionCardProps = {
  suggestion: GardenSizeSuggestion;
  selectedSize: GardenSize;
  loading?: boolean;
  onSelectSize: (size: GardenSize) => void;
};

export function GardenSizeSuggestionCard({
  suggestion,
  selectedSize,
  loading,
  onSelectSize,
}: GardenSizeSuggestionCardProps) {
  const guide = GARDEN_SIZE_GUIDE[suggestion.suggestedSize];

  return (
    <div className="rounded-xl border border-gardens-primary/25 bg-gardens-light/30 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
        Suggested garden size
      </p>
      {loading ? (
        <p className="mt-2 text-sm text-stone-600">Analysing satellite imagery…</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-stone-800">
            We estimate about <strong>{suggestion.estimatedMaintainedSqm} m²</strong> of maintained lawn
            and beds — <strong>{guide.label}</strong> band.
            {suggestion.requiresPersonalisedQuote ? (
              <span className="block mt-1 text-amber-800">
                This may exceed our largest standard band — we&apos;ll confirm before your first visit.
              </span>
            ) : null}
          </p>
          <p className="mt-2 text-xs text-stone-500">{suggestion.disclaimer}</p>
          {selectedSize !== suggestion.suggestedSize ? (
            <button
              type="button"
              className="mt-3 text-sm font-medium text-gardens-primary hover:underline"
              onClick={() => onSelectSize(suggestion.suggestedSize)}
            >
              Use suggested size ({guide.shortName})
            </button>
          ) : (
            <p className="mt-3 text-xs font-medium text-gardens-primary">Using suggested size</p>
          )}
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-stone-600 hover:text-gardens-primary">
              Change garden size
            </summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {GARDEN_SIZE_ORDER.map((size) => {
                const g = GARDEN_SIZE_GUIDE[size];
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => onSelectSize(size)}
                    className={`rounded-lg border px-2 py-2 text-left text-xs transition ${
                      active
                        ? "border-gardens-primary bg-white ring-1 ring-gardens-primary/30"
                        : "border-stone-200 bg-white hover:border-gardens-primary/40"
                    }`}
                  >
                    <span className="font-semibold text-gardens-dark">{g.label}</span>
                    <span className="mt-0.5 block text-stone-500">{g.description}</span>
                  </button>
                );
              })}
            </div>
          </details>
        </>
      )}
    </div>
  );
}
