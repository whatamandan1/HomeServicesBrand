"use client";

import { useState } from "react";
import type { JobVisit } from "@/lib/api";
import { StatusBadge } from "@/components/ui";
import { canManageVisit, todayDateInputValue, toApiDate } from "@/lib/visit-status";

type VisitListProps = {
  visits: JobVisit[];
  busyId: string | null;
  allowInProgress?: boolean;
  readOnly?: boolean;
  onCancel: (visitId: string) => Promise<void>;
  onReschedule: (visitId: string, scheduledDate: string) => Promise<void>;
  emptyMessage?: string;
};

export function VisitList({
  visits,
  busyId,
  allowInProgress = false,
  readOnly = false,
  onCancel,
  onReschedule,
  emptyMessage = "No visits scheduled.",
}: VisitListProps) {
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(todayDateInputValue());

  if (visits.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  return (
    <ul className="mt-2 space-y-3">
      {visits.map((v) => {
        const manageable = !readOnly && canManageVisit(v.status, allowInProgress);
        const isRescheduling = rescheduleId === v.id;

        return (
          <li key={v.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-medium">
                  {v.scheduledDate.slice(0, 10)} — {v.postcode}
                </div>
                <div className="text-sm text-stone-500">{v.availabilityWindow}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={v.status} />
                  {v.assignedProviderName && (
                    <span className="text-xs text-stone-500">Gardener: {v.assignedProviderName}</span>
                  )}
                </div>
              </div>
              {manageable && !isRescheduling && (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <button
                    type="button"
                    disabled={busyId === v.id}
                    className="min-h-[44px] rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                    onClick={() => {
                      setRescheduleId(v.id);
                      setNewDate(v.scheduledDate.slice(0, 10));
                    }}
                  >
                    Reschedule
                  </button>
                  <button
                    type="button"
                    disabled={busyId === v.id}
                    className="min-h-[44px] rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                    onClick={() => onCancel(v.id)}
                  >
                    {busyId === v.id ? "Cancelling…" : "Cancel visit"}
                  </button>
                </div>
              )}
            </div>

            {isRescheduling && (
              <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-end">
                <label className="block flex-1 text-sm">
                  <span className="font-medium text-stone-700">New date</span>
                  <input
                    type="date"
                    min={todayDateInputValue()}
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="field-input mt-1"
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="min-h-[44px] rounded-full px-4 py-2 text-sm text-stone-600 hover:bg-stone-50"
                    onClick={() => setRescheduleId(null)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!newDate || busyId === v.id}
                    className="min-h-[44px] rounded-full bg-gardens-primary px-4 py-2 text-sm font-semibold text-white hover:bg-gardens-dark disabled:opacity-50"
                    onClick={async () => {
                      await onReschedule(v.id, toApiDate(newDate));
                      setRescheduleId(null);
                    }}
                  >
                    {busyId === v.id ? "Saving…" : "Save new date"}
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
