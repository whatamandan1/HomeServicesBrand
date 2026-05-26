import { AVAILABILITY_PRESETS } from "@/lib/signup-utils";

export function AvailabilityPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-stone-700">When works best for visits?</p>
      <div className="flex flex-wrap gap-2">
        {AVAILABILITY_PRESETS.map((preset) => {
          const selected = value === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition ${
                selected
                  ? "border-gardens-primary bg-gardens-primary text-white"
                  : "border-stone-200 bg-white text-stone-700 hover:border-gardens-primary/40"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>
      <label className="block text-sm font-medium text-stone-700">
        Or describe your preference
        <input
          type="text"
          value={AVAILABILITY_PRESETS.includes(value as (typeof AVAILABILITY_PRESETS)[number]) ? "" : value}
          placeholder="e.g. Tuesday or Thursday mornings"
          onChange={(e) => onChange(e.target.value)}
          className="field-input"
        />
      </label>
      {!value.trim() && (
        <p className="text-xs text-stone-500">Pick a preset or type when we can visit.</p>
      )}
    </div>
  );
}
