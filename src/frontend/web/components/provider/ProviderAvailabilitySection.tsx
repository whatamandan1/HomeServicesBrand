"use client";

import { useEffect, useState } from "react";
import { api, type ProviderAvailability } from "@/lib/api";

const WORKING_DAYS = [
  { label: "Mon", bit: 1 },
  { label: "Tue", bit: 2 },
  { label: "Wed", bit: 4 },
  { label: "Thu", bit: 8 },
  { label: "Fri", bit: 16 },
  { label: "Sat", bit: 32 },
  { label: "Sun", bit: 64 },
] as const;

function isDaySelected(mask: number, bit: number) {
  return (mask & bit) !== 0;
}

function toggleDay(mask: number, bit: number) {
  return isDaySelected(mask, bit) ? mask & ~bit : mask | bit;
}

export function ProviderAvailabilitySection({
  token,
  onNotice,
  onError,
  onUpdated,
}: {
  token: string;
  onNotice: (message: string | null) => void;
  onError: (message: string | null) => void;
  onUpdated?: () => void;
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
      .providerAvailability(token)
      .then((data) => {
        setAvailability(data);
        setWorkingDaysMask(data.workingDaysMask);
        setWorkDayStart(data.workDayStart);
        setWorkDayEnd(data.workDayEnd);
      })
      .catch((e) =>
        onError(e instanceof Error ? e.message : "Could not load availability")
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [token]);

  async function saveSchedule() {
    setSaving(true);
    onError(null);
    onNotice(null);
    try {
      const updated = await api.providerUpdateAvailability(token, {
        workingDaysMask,
        workDayStart,
        workDayEnd,
      });
      setAvailability(updated);
      onNotice("Working schedule saved.");
      onUpdated?.();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not save schedule");
    } finally {
      setSaving(false);
    }
  }

  async function addBlockedDate() {
    if (!blockedDate) {
      onError("Choose a date to block.");
      return;
    }
    setBlockedBusy(true);
    onError(null);
    onNotice(null);
    try {
      const updated = await api.providerAddBlockedDate(token, {
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
      onNotice(
        released > 0
          ? `Day off added. ${released} visit${released === 1 ? "" : "s"} returned to the open pool.`
          : "Day off added."
      );
      onUpdated?.();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not block that date");
    } finally {
      setBlockedBusy(false);
    }
  }

  async function removeBlockedDate(id: string) {
    setBlockedBusy(true);
    onError(null);
    try {
      await api.providerRemoveBlockedDate(token, id);
      setAvailability((current) =>
        current
          ? { ...current, blockedDates: current.blockedDates.filter((d) => d.id !== id) }
          : current
      );
      onNotice("Day off removed.");
      onUpdated?.();
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not remove blocked date");
    } finally {
      setBlockedBusy(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading availability…</p>;
  }

  return (
    <div className="rounded-lg border bg-white p-4 text-sm shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-gardens-dark">Your availability</p>
          <p className="mt-1 text-stone-600">
            Open jobs and auto-assignments match your working days, hours, and blocked dates to each customer&apos;s preferred time window (e.g. mornings, afternoons).
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-4 border-t border-stone-100 pt-4">
        <div>
          <p className="font-medium text-stone-700">Working days</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {WORKING_DAYS.map((day) => {
              const selected = isDaySelected(workingDaysMask, day.bit);
              return (
                <button
                  key={day.label}
                  type="button"
                  onClick={() => setWorkingDaysMask((mask) => toggleDay(mask, day.bit))}
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
      </div>

      <div className="mt-6 space-y-3 border-t border-stone-100 pt-4">
        <p className="font-medium text-stone-700">Blocked dates</p>
        {(availability?.blockedDates.length ?? 0) === 0 ? (
          <p className="text-stone-500">No days off scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {availability?.blockedDates.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
              >
                <div>
                  <span className="font-medium">{entry.blockedDate}</span>
                  {entry.reason && (
                    <span className="ml-2 text-stone-500">- {entry.reason}</span>
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
