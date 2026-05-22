"use client";

import { useEffect, useState } from "react";
import { api, type JobVisit, type ProviderProfile } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { StatusBadge } from "@/components/ui";

export default function ProviderPage() {
  const { auth, ready } = useAuth();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [open, setOpen] = useState<JobVisit[]>([]);
  const [mine, setMine] = useState<JobVisit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function refresh() {
    if (!auth?.token) return;
    setError(null);
    Promise.all([
      api.providerProfile(auth.token),
      api.providerOpenVisits(auth.token),
      api.providerMyVisits(auth.token),
    ])
      .then(([p, o, m]) => {
        setProfile(p);
        setOpen(o);
        setMine(m);
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : "Failed to load jobs");
      });
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
    try {
      if (action === "start") await api.startVisit(auth.token, visitId);
      else await api.completeVisit(auth.token, visitId);
      refresh();
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
        <a href="/login" className="underline">Sign in</a> with provider@gardenssorted.local / Provider123!
      </p>
    );
  }

  const sectors = profile?.postcodeSectors ?? [];
  const upcoming = mine.filter((v) => v.status !== "Completed" && v.status !== "Cancelled");
  const done = mine.filter((v) => v.status === "Completed");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Provider jobs</h1>
      <p className="text-sm text-stone-500">{auth.email}</p>
      {profile && !profile.isApproved && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your account is pending admin approval — you will not see open jobs until approved.
        </p>
      )}
      {sectors.length > 0 && (
        <p className="text-sm text-stone-600">
          Your postcode sectors: <strong>{sectors.join(", ")}</strong>
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="font-semibold">Open in your area</h2>
        {open.length === 0 ? (
          <div className="mt-2 space-y-2 text-sm text-stone-500">
            <p>No open visits in your postcode sectors right now.</p>
            <p>
              Jobs appear here after a customer subscription is active and visits are opened for dispatch.
              Demo provider covers <strong>LS1</strong>, <strong>LS2</strong>, and <strong>WF1</strong> — customer
              signups need a matching postcode (e.g. LS1 4AP).
            </p>
            <p>
              After the next API deploy, demo claimable visits are seeded automatically. An admin can also
              use <strong>Open visits for dispatch</strong> on the admin portal.
            </p>
          </div>
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
                  onClick={async () => {
                    setError(null);
                    try {
                      await api.claimVisit(auth.token, v.id);
                      refresh();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Claim failed");
                    }
                  }}
                >
                  Claim job
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold">My visits</h2>
        {upcoming.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No active visits — claim a job above.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {upcoming.map((v) => (
              <li
                key={v.id}
                className="rounded-lg border bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">
                      {v.scheduledDate.slice(0, 10)} — {v.postcode}
                    </div>
                    <div className="text-sm text-stone-500">{v.availabilityWindow}</div>
                    <div className="mt-2">
                      <StatusBadge status={v.status} />
                    </div>
                  </div>
                  {v.status === "Claimed" && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      className="min-h-[48px] rounded-full bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                      onClick={() => runVisitAction(v.id, "start")}
                    >
                      {busyId === v.id ? "Starting…" : "Start visit"}
                    </button>
                  )}
                  {v.status === "InProgress" && (
                    <button
                      type="button"
                      disabled={busyId === v.id}
                      className="min-h-[48px] rounded-full bg-gardens-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-gardens-dark disabled:opacity-50"
                      onClick={() => runVisitAction(v.id, "complete")}
                    >
                      {busyId === v.id ? "Saving…" : "Mark complete"}
                    </button>
                  )}
                </div>
              </li>
            ))}
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
