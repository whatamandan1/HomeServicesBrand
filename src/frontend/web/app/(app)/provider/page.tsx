"use client";

import { useEffect, useState } from "react";
import { api, type JobVisit } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { DataTable, StatusBadge } from "@/components/ui";

export default function ProviderPage() {
  const { auth, ready } = useAuth();
  const [open, setOpen] = useState<JobVisit[]>([]);
  const [mine, setMine] = useState<JobVisit[]>([]);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    if (!auth?.token) return;
    api.providerOpenVisits(auth.token).then(setOpen);
    api.providerMyVisits(auth.token).then(setMine);
  }

  useEffect(() => {
    if (!auth?.token || auth.role !== "Provider") return;
    refresh();
  }, [auth]);

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

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Provider jobs</h1>
      <p className="text-sm text-stone-500">{auth.email}</p>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="font-semibold">Open in your area</h2>
        {open.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            No open visits in your postcode sectors right now.
          </p>
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
        <h2 className="font-semibold">My claimed visits</h2>
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "postcode", label: "Postcode" },
            { key: "window", label: "Window" },
            { key: "status", label: "Status" },
          ]}
          rows={mine.map((v) => ({
            date: v.scheduledDate.slice(0, 10),
            postcode: v.postcode,
            window: v.availabilityWindow,
            status: v.status,
          }))}
          emptyMessage="You have not claimed any visits yet."
        />
      </section>
    </div>
  );
}
