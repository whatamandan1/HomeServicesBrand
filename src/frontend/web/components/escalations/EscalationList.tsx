"use client";

import { useState } from "react";
import type { Escalation } from "@/lib/api";
import { StatusBadge } from "@/components/ui";

type EscalationListProps = {
  escalations: Escalation[];
  busyId: string | null;
  onStart: (id: string) => Promise<void>;
  onResolve: (id: string, notes?: string) => Promise<void>;
  readOnly?: boolean;
  emptyMessage?: string;
};

export function EscalationList({
  escalations,
  busyId,
  onStart,
  onResolve,
  readOnly = false,
  emptyMessage = "No escalations.",
}: EscalationListProps) {
  const [resolveId, setResolveId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  if (escalations.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-2 space-y-3">
      {escalations.map((e) => {
        const isResolving = resolveId === e.id;
        const status = e.status.replace(/\s+/g, "");

        return (
          <li key={e.id} className="rounded-lg border bg-white p-4 text-sm shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-stone-400">
                    {new Date(e.createdAtUtc).toLocaleString("en-GB")}
                  </span>
                </div>
                {e.customerEmail ? (
                  <p className="mt-1 text-xs text-stone-500">{e.customerEmail}</p>
                ) : (
                  <p className="mt-1 text-xs text-stone-500">Website visitor</p>
                )}
                <p className="mt-2 text-stone-700">{e.reason}</p>
                {e.notes && (
                  <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    <span className="font-medium">Notes:</span> {e.notes}
                  </p>
                )}
              </div>
              {!readOnly && status === "Open" && (
                <button
                  type="button"
                  disabled={busyId === e.id}
                  className="min-h-[44px] rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                  onClick={() => onStart(e.id)}
                >
                  {busyId === e.id ? "Assigning…" : "Take case"}
                </button>
              )}
              {!readOnly && status === "InProgress" && !isResolving && (
                <button
                  type="button"
                  disabled={busyId === e.id}
                  className="min-h-[44px] rounded-full bg-gardens-primary px-4 py-2 text-sm font-semibold text-white hover:bg-gardens-dark disabled:opacity-50"
                  onClick={() => {
                    setResolveId(e.id);
                    setNotes(e.notes ?? "");
                  }}
                >
                  Resolve
                </button>
              )}
            </div>

            {isResolving && (
              <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
                <label className="block text-sm">
                  <span className="font-medium text-stone-700">Resolution notes (optional)</span>
                  <textarea
                    value={notes}
                    onChange={(ev) => setNotes(ev.target.value)}
                    rows={3}
                    className="field-input mt-1 resize-y"
                    placeholder="What was done to resolve this?"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="min-h-[44px] rounded-full px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                    onClick={() => setResolveId(null)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={busyId === e.id}
                    className="min-h-[44px] rounded-full bg-gardens-primary px-4 py-2 text-sm font-semibold text-white hover:bg-gardens-dark disabled:opacity-50"
                    onClick={async () => {
                      await onResolve(e.id, notes.trim() || undefined);
                      setResolveId(null);
                      setNotes("");
                    }}
                  >
                    {busyId === e.id ? "Saving…" : "Mark resolved"}
                  </button>
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
