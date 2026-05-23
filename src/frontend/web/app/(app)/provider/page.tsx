"use client";

import { useEffect, useRef, useState } from "react";
import { api, type JobVisit, type ProviderProfile } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { isActiveVisit, normalizeVisitStatus, visitNextAction } from "@/lib/visit-status";
import { StatusBadge } from "@/components/ui";
import { ListMapToggle, type ViewMode } from "@/components/map/ListMapToggle";
import { VisitMap } from "@/components/map/VisitMap";

export default function ProviderPage() {
  const { auth, ready } = useAuth();
  const myVisitsRef = useRef<HTMLElement>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [open, setOpen] = useState<JobVisit[]>([]);
  const [mine, setMine] = useState<JobVisit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openView, setOpenView] = useState<ViewMode>("list");
  const [myVisitsView, setMyVisitsView] = useState<ViewMode>("list");

  function scrollToMyVisits() {
    myVisitsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function refresh() {
    if (!auth?.token) return;
    setError(null);

    const [profileResult, openResult, mineResult] = await Promise.allSettled([
      api.providerProfile(auth.token),
      api.providerOpenVisits(auth.token),
      api.providerMyVisits(auth.token),
    ]);

    if (profileResult.status === "fulfilled") setProfile(profileResult.value);
    if (openResult.status === "fulfilled") setOpen(openResult.value);
    if (mineResult.status === "fulfilled") setMine(mineResult.value);

    const failures = [profileResult, openResult, mineResult].filter(
      (r) => r.status === "rejected"
    );
    if (failures.length === 3) {
      const first = failures[0];
      setError(
        first.status === "rejected" && first.reason instanceof Error
          ? first.reason.message
          : "Failed to load jobs"
      );
    }
  }

  useEffect(() => {
    if (!auth?.token || auth.role !== "Provider") return;
    refresh();
  }, [auth]);

  async function runVisitAction(
    visitId: string,
    action: "start" | "complete"
  ) {
    if (!auth?.token) return;
    setBusyId(visitId);
    setError(null);
    setNotice(null);
    try {
      const updated =
        action === "start"
          ? await api.startVisit(auth.token, visitId)
          : await api.completeVisit(auth.token, visitId);
      setMine((visits) =>
        visits.map((v) => (v.id === visitId ? updated : v))
      );
      setNotice(
        action === "start"
          ? "Visit started — mark complete when you finish on site."
          : "Visit marked complete."
      );
      scrollToMyVisits();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  if (!ready) return <p className="text-stone-500">Loading…</p>;
  if (!auth) {
    return (
      <p>
        Please <a href="/login" className="underline">login</a> as a provider.
      </p>
    );
  }
  if (auth.role !== "Provider") {
    return (
      <p>
        You are logged in as <strong>{auth.role}</strong>.{" "}
        <a href="/login" className="underline">Sign in</a> with a provider account.
      </p>
    );
  }

  const coveragePostcode = profile?.coveragePostcode;
  const coverageRadiusMiles = profile?.coverageRadiusMiles ?? 0;
  const coveredOutcodes = profile?.coveredOutcodes ?? [];
  const coverageFallback =
    profile?.coveragePostcode && coverageRadiusMiles > 0
      ? {
          postcode: profile.coveragePostcode,
          radiusMiles: coverageRadiusMiles,
          latitude: profile.coverageLatitude,
          longitude: profile.coverageLongitude,
          label: `Your coverage (${profile.coveragePostcode})`,
        }
      : undefined;
  const upcoming = mine.filter((v) => isActiveVisit(v.status));
  const done = mine.filter((v) => normalizeVisitStatus(v.status) === "completed");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Provider jobs</h1>
      <p className="text-sm text-stone-500">{auth.email}</p>
      {profile && !profile.isApproved && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your account is pending admin approval — you will not see open jobs until approved.
        </p>
      )}
      {coveragePostcode && (
        <div className="text-sm text-stone-600">
          <p>
            Your coverage area: <strong>{coveragePostcode}</strong>, within{" "}
            <strong>{coverageRadiusMiles} miles</strong>
          </p>
          {coveredOutcodes.length > 0 && (
            <p className="mt-1 text-xs text-stone-500">
              Postcode areas: {coveredOutcodes.slice(0, 24).join(", ")}
              {coveredOutcodes.length > 24
                ? ` and ${coveredOutcodes.length - 24} more`
                : ""}
            </p>
          )}
        </div>
      )}
      {notice && (
        <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
          {notice}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Open in your area</h2>
          {open.length > 0 && <ListMapToggle value={openView} onChange={setOpenView} />}
        </div>
        {open.length === 0 ? (
          <div className="mt-2 space-y-2 text-sm text-stone-500">
            <p>No open visits in your coverage area right now.</p>
            <p>
              Demo provider covers jobs within <strong>15 miles</strong> of{" "}
              <strong>LS1 4AP</strong>.
            </p>
          </div>
        ) : openView === "map" ? (
          <VisitMap
            visits={open}
            coverageFallback={coverageFallback}
            className="mt-2"
            emptyMessage="No open visits with map coordinates."
          />
        ) : (
          <ul className="mt-2 space-y-3">
            {open.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-4 shadow-sm"
              >
                <div>
                  <div className="font-medium">
                    {v.scheduledDate.slice(0, 10)} — {v.postcode}
                  </div>
                  <div className="text-sm text-stone-500">{v.availabilityWindow}</div>
                  <StatusBadge status={v.status} />
                </div>
                <button
                  className="min-h-[48px] w-full rounded-full bg-gardens-primary px-4 py-2.5 text-base font-semibold text-white sm:w-auto sm:rounded-lg sm:text-sm"
                  disabled={busyId === v.id}
                  onClick={async () => {
                    setError(null);
                    setNotice(null);
                    setBusyId(v.id);
                    try {
                      const claimed = await api.claimVisit(auth.token, v.id);
                      setOpen((visits) => visits.filter((visit) => visit.id !== v.id));
                      setMine((visits) => {
                        const rest = visits.filter((visit) => visit.id !== claimed.id);
                        return [...rest, claimed].sort((a, b) =>
                          a.scheduledDate.localeCompare(b.scheduledDate)
                        );
                      });
                      setNotice("Job claimed — scroll down to start your visit when you arrive.");
                      scrollToMyVisits();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Claim failed");
                    } finally {
                      setBusyId(null);
                    }
                  }}
                >
                  {busyId === v.id ? "Claiming…" : "Claim job"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section ref={myVisitsRef} id="my-visits">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold">My visits</h2>
            <p className="mt-1 text-sm text-stone-500">
              After claiming, use <strong>Start visit</strong> on arrival, then <strong>Mark complete</strong> when finished.
            </p>
          </div>
          {upcoming.length > 0 && <ListMapToggle value={myVisitsView} onChange={setMyVisitsView} />}
        </div>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No active visits — claim a job above.</p>
        ) : myVisitsView === "map" ? (
          <VisitMap
            visits={upcoming}
            coverageFallback={coverageFallback}
            className="mt-2"
            emptyMessage="No active visits with map coordinates."
          />
        ) : (
          <ul className="mt-2 space-y-3">
            {upcoming.map((v) => {
              const action = visitNextAction(v.status);
              return (
                <li
                  key={v.id}
                  className="rounded-lg border bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="font-medium">
                        {v.scheduledDate.slice(0, 10)} — {v.postcode}
                      </div>
                      <div className="text-sm text-stone-500">{v.availabilityWindow}</div>
                      <div className="mt-2">
                        <StatusBadge status={v.status} />
                      </div>
                    </div>
                    {action === "start" && (
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        className="min-h-[48px] w-full rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 sm:w-auto"
                        onClick={() => runVisitAction(v.id, "start")}
                      >
                        {busyId === v.id ? "Starting…" : "Start visit"}
                      </button>
                    )}
                    {action === "complete" && (
                      <button
                        type="button"
                        disabled={busyId === v.id}
                        className="min-h-[48px] w-full rounded-full bg-gardens-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-gardens-dark disabled:opacity-50 sm:w-auto"
                        onClick={() => runVisitAction(v.id, "complete")}
                      >
                        {busyId === v.id ? "Saving…" : "Mark complete"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section>
          <h2 className="font-semibold">Completed</h2>
          <ul className="mt-2 space-y-2">
            {done.map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50 px-4 py-3 text-sm"
              >
                <span>
                  {v.scheduledDate.slice(0, 10)} — {v.postcode}
                </span>
                <StatusBadge status={v.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
