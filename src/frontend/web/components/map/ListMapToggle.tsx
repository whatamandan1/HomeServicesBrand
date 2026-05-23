"use client";

import { List, Map } from "lucide-react";

export type ViewMode = "list" | "map";

export function ListMapToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-stone-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("list")}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
          value === "list"
            ? "bg-gardens-primary text-white"
            : "text-stone-600 hover:bg-stone-50"
        }`}
        aria-pressed={value === "list"}
      >
        <List className="h-4 w-4" />
        List
      </button>
      <button
        type="button"
        onClick={() => onChange("map")}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition ${
          value === "map"
            ? "bg-gardens-primary text-white"
            : "text-stone-600 hover:bg-stone-50"
        }`}
        aria-pressed={value === "map"}
      >
        <Map className="h-4 w-4" />
        Map
      </button>
    </div>
  );
}
