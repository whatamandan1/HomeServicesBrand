"use client";

import { useEffect, useState } from "react";
import { api, type ProviderAvailability } from "@/lib/api";
import {
  isWorkingDaySelected,
  PROVIDER_WORKING_DAYS,
  toggleWorkingDay,
} from "@/lib/provider-availability";

export function AdminProviderAvailabilitySection({
  token,
  providerId,
  onNotice,
  onError,
}: {
  token: string;
  providerId: string;
  onNotice?: (message: string | null) => void;
  onError?: (message: string | null) => void;
}) {
  const [availability, setAvailability] = useState<ProviderAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workingDaysMask, setWorkingDaysMask] = useState(31);
  const [workDayStart, setWorkDayStart] = useState("08:00");
  const [workDayEnd, setWorkDayEnd] = useState("16:00");
  const [blockedDate, setBlockedDate] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [blockedBusy, setBlockedBusy] = useState(false);

  function load() {
    setLoading(true);
    api
      .adminProviderAvailability(token, providerId)
      .then((data) => {
        setAvailability(data);
        setWorkingDaysMask(data.workingDaysMask);
        setWorkDayStart(data.workDayStart);
        setWorkDayEnd(data.workDayEnd);
      })
      .catch((e) =>
        onError?.(e instanceof Error ? e.message : "Could not load availability")
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [providerId, token]);

  async function saveSchedule() {
    setSaving(true);
    onError?.(null);
    onNotice?.(null);
    try {
      const updated = await api.adminUpdateProviderAvailability(token, providerId, {
        workingDaysMask,
        workDayStart,
        workDayEnd,
      });
      setAvailability(updated);
      onNotice?.("Provider schedule updated.");
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not save schedule");
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedDate() {
    if (!blockedDate) {
      onError?.("Choose a date to block.");
      return;
    }
    setBlockedBusy(true);
    onError?.(null);
    onNotice?.(null);
    try {
      const updated = await api.adminAddProviderBlockedDate(token, providerId, {
        blockedDate,
        reason: blockedReason.trim() || null,
      });
      setAvailability((current) =>
        current
          ? {
              ...current,
              blockedDates: [...current.blockedDates, updated].sort((a, b) =>
                a.blockedDate.localeCompare(b.blockedDate)
              ),
            }
          : current
      );
      setBlockedDate("");
      setBlockedReason("");
      const released = updated.releasedVisitCount ?? 0;
      onNotice?.(
        released > 0
          ? `Day off added. ${released} visit${released === 1 ? "" : "s"} returned to the open pool.`
          : "Day off added."
      );
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not block that date");
    } finally {
      setBlockedBusy(false);
    }
  }

  async function removeBlockedDate(id: string) {
    setBlockedBusy(true);
    onError?.(null);
    try {
      await api.adminRemoveProviderBlockedDate(token, providerId, id);
      setAvailability((current) =>
        current
          ? { ...current, blockedDates: current.blockedDates.filter((d) => d.id !== id) }
          : current
      );
      onNotice?.("Day off removed.");
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not remove blocked date");
    } finally {
      setBlockedBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading availability…</p>;
  }

  if (!availability) {
    return <p className="text-sm text-stone-500">Could not load availability.</p>;
  }

  return (
    <div className="space-y-4 rounded-lg border bg-white p-4 text-sm shadow-sm">
      <div>
        <p className="font-medium text-gardens-dark">Availability</p>
        <p className="mt-1 text-stone-600">
          Edit on behalf of the provider. Changes release conflicting assigned visits.
        </p>
      </div>

      <div>
        <p className="font-medium text-stone-700">Working days</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {PROVIDER_WORKING_DAYS.map((day) => {
            const selected = isWorkingDaySelected(workingDaysMask, day.bit);
            return (
              <button
                key={day.label}
                type="button"
                onClick={() => setWorkingDaysMask((mask) => toggleWorkingDay(mask, day.bit))}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                  selected
                    ? "bg-gardens-primary text-white"
                    : "border border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block font-medium text-stone-700">
          Start time
          <input
            type="time"
            value={workDayStart}
            onChange={(e) => setWorkDayStart(e.target.value)}
            className="field-input mt-1"
          />
        </label>
        <label className="block font-medium text-stone-700">
          End time
          <input
            type="time"
            value={workDayEnd}
            onChange={(e) => setWorkDayEnd(e.target.value)}
            className="field-input mt-1"
          />
        </label>
      </div>

      <button
        type="button"
        disabled={saving}
        onClick={saveSchedule}
        className="rounded-lg bg-gardens-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save schedule"}
      </button>

      <div className="space-y-3 border-t border-stone-100 pt-4">
        <p className="font-medium text-stone-700">Blocked dates</p>
        {availability.blockedDates.length === 0 ? (
          <p className="text-stone-500">No days off scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {availability.blockedDates.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
              >
                <div>
                  <span className="font-medium">{entry.blockedDate}</span>
                  {entry.reason && (
                    <span className="ml-2 text-stone-500">— {entry.reason}</span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={blockedBusy}
                  onClick={() => removeBlockedDate(entry.id)}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-3 sm:grid-cols-[auto,1fr,auto] sm:items-end">
          <label className="block font-medium text-stone-700">
            Date
            <input
              type="date"
              value={blockedDate}
              onChange={(e) => setBlockedDate(e.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label className="block font-medium text-stone-700">
            Reason (optional)
            <input
              value={blockedReason}
              onChange={(e) => setBlockedReason(e.target.value)}
              placeholder="Holiday, training, etc."
              className="field-input mt-1"
            />
          </label>
          <button
            type="button"
            disabled={blockedBusy}
            onClick={addBlockedDate}
            className="rounded-lg border border-stone-200 px-4 py-2 font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {blockedBusy ? "Saving…" : "Add day off"}
          </button>
        </div>
      </div>
    </div>
  );
}
