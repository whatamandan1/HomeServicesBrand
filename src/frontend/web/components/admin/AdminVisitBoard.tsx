"use client";

import { useCallback, useMemo, useState } from "react";
import type { AdminJobVisit } from "@/lib/api";
import { StatusBadge } from "@/components/ui";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { matchesSearch, useAdminListControls } from "@/lib/admin-list-controls";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "OpenForClaim", label: "Open for claim" },
  { id: "Scheduled", label: "Scheduled" },
  { id: "Claimed", label: "Claimed" },
  { id: "InProgress", label: "In progress" },
  { id: "Completed", label: "Completed" },
] as const;

function formatWhen(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isExpiringSoon(iso: string | null) {
  if (!iso) return false;
  const expires = new Date(iso).getTime();
  return expires - Date.now() < 24 * 60 * 60 * 1000;
}

export function AdminVisitBoard({
  visits,
  statusFilter,
  onStatusFilterChange,
  busyId,
  onCancel,
  onReschedule,
}: {
  visits: AdminJobVisit[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  busyId: string | null;
  onCancel: (visitId: string) => Promise<void>;
  onReschedule: (visitId: string, scheduledDate: string) => Promise<void>;
}) {
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [newDate, setNewDate] = useState("");

  const filteredByTab =
    statusFilter === "all"
      ? visits
      : visits.filter((v) => v.status === statusFilter);

  const openCount = useMemo(
    () => visits.filter((v) => v.status === "OpenForClaim").length,
    [visits]
  );

  const searchFn = useCallback(
    (visit: AdminJobVisit, query: string) =>
      matchesSearch(
        query,
        visit.scheduledDate,
        visit.postcode,
        visit.customerName,
        visit.availabilityWindow,
        visit.status,
        visit.assignedProviderName,
        visit.dispatchOfferStatus
      ),
    []
  );

  const controls = useAdminListControls(filteredByTab, searchFn);

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onStatusFilterChange(filter.id)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              statusFilter === filter.id
                ? "border-gardens-primary bg-gardens-primary text-white"
                : "border-stone-200 bg-white text-stone-700 hover:border-gardens-primary/40"
            }`}
          >
            {filter.label}
            {filter.id === "OpenForClaim" && openCount > 0 ? ` (${openCount})` : ""}
          </button>
        ))}
      </div>

      <AdminListToolbar
        controls={controls}
        placeholder="Search customer, postcode, gardener, status…"
      />

      {controls.pageItems.length === 0 ? (
        <p className="text-sm text-stone-500">No visits match this view.</p>
      ) : (
        <ul className="space-y-3">
          {controls.pageItems.map((v) => {
            const expiring = v.status === "OpenForClaim" && isExpiringSoon(v.dispatchOfferExpiresAtUtc);
            return (
              <li
                key={v.id}
                className={`rounded-lg border bg-white p-4 shadow-sm ${
                  expiring ? "border-amber-300 bg-amber-50/40" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {v.scheduledDate.slice(0, 10)} · {v.postcode}
                    </div>
                    {v.customerName && (
                      <p className="text-sm text-stone-600">{v.customerName}</p>
                    )}
                    <p className="text-sm text-stone-500">{v.availabilityWindow}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusBadge status={v.status} />
                      {v.assignedProviderName && (
                        <span className="text-xs text-stone-500">
                          Gardener: {v.assignedProviderName}
                        </span>
                      )}
                    </div>
                    {v.status === "OpenForClaim" && (
                      <div className="mt-2 space-y-0.5 text-xs text-stone-500">
                        {v.daysOpenForClaim != null && (
                          <p>Open {v.daysOpenForClaim} day{v.daysOpenForClaim === 1 ? "" : "s"}</p>
                        )}
                        {v.dispatchOfferExpiresAtUtc && (
                          <p className={expiring ? "font-medium text-amber-800" : undefined}>
                            Offer expires {formatWhen(v.dispatchOfferExpiresAtUtc)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
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
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
                      onClick={() => onCancel(v.id)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {rescheduleId === v.id && (
                  <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-end">
                    <label className="block flex-1 text-sm">
                      <span className="font-medium text-stone-700">New date</span>
                      <input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        className="field-input mt-1"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50"
                        onClick={() => setRescheduleId(null)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        disabled={!newDate || busyId === v.id}
                        className="rounded-lg bg-gardens-primary px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
                        onClick={async () => {
                          await onReschedule(v.id, `${newDate}T12:00:00Z`);
                          setRescheduleId(null);
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
