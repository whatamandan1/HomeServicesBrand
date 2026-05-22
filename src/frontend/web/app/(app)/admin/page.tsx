"use client";

import { useEffect, useState } from "react";
import { api, type AdminCustomer, type AdminProvider, type Escalation, type JobVisit } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { DataTable, StatCard, StatusBadge } from "@/components/ui";

const DASH_LABELS: Record<string, string> = {
  customerCount: "Customers",
  activeSubscriptions: "Active subs",
  providerCount: "Providers",
  openVisits: "Open visits",
  openEscalations: "Escalations",
};

export default function AdminPage() {
  const { auth, ready } = useAuth();
  const [dash, setDash] = useState<Record<string, number> | null>(null);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [visits, setVisits] = useState<JobVisit[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);

  function refreshVisits() {
    if (!auth?.token) return;
    api.adminVisits(auth.token).then(setVisits);
    api.adminDashboard(auth.token).then(setDash);
  }

  useEffect(() => {
    if (!auth?.token || auth.role !== "Admin") return;
    api.adminDashboard(auth.token).then(setDash);
    api.adminCustomers(auth.token).then(setCustomers);
    api.adminProviders(auth.token).then(setProviders);
    api.adminVisits(auth.token).then(setVisits);
    api.adminEscalations(auth.token).then(setEscalations);
  }, [auth]);

  if (!ready) return <p className="text-stone-500">Loading…</p>;
  if (!auth) {
    return (
      <p>
        Please <a href="/login" className="underline">login</a> as admin.
      </p>
    );
  }
  if (auth.role !== "Admin") {
    return (
      <p>
        You are logged in as <strong>{auth.role}</strong>.{" "}
        <a href="/login" className="underline">Sign in</a> with admin@gardenssorted.local / Admin123!
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Operations CRM</h1>

      {dash && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Object.entries(dash).map(([k, v]) => (
            <StatCard key={k} label={DASH_LABELS[k] ?? k} value={v} />
          ))}
        </div>
      )}

      <section>
        <h2 className="font-semibold">Providers</h2>
        <div className="mt-2 space-y-2">
          {providers.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3 text-sm shadow-sm"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-stone-500">{p.email}</div>
                <div className="text-xs text-stone-400">
                  Sectors: {p.sectors?.join(", ") || "—"}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {p.isApproved ? (
                  <span className="text-green-700">Approved</span>
                ) : (
                  <button
                    className="rounded bg-gardens-primary px-3 py-1 text-white"
                    onClick={() =>
                      api.approveProvider(auth.token, p.id).then(() =>
                        api.adminProviders(auth.token).then(setProviders)
                      )
                    }
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <p className="text-sm text-stone-500">No providers yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-semibold">Customers</h2>
        <DataTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "joined", label: "Joined" },
          ]}
          rows={customers.map((c) => ({
            name: c.name,
            email: c.email,
            joined: new Date(c.createdAtUtc).toLocaleDateString("en-GB"),
          }))}
          emptyMessage="No customers yet."
        />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Visits</h2>
          <button
            type="button"
            className="rounded-lg bg-gardens-primary px-4 py-2 text-sm font-semibold text-white"
            onClick={async () => {
              if (!auth?.token) return;
              setDispatchMsg(null);
              try {
                await api.adminOpenDispatch(auth.token);
                setDispatchMsg("Scheduled visits opened for provider claiming.");
                refreshVisits();
              } catch (e) {
                setDispatchMsg(e instanceof Error ? e.message : "Dispatch failed");
              }
            }}
          >
            Open visits for dispatch
          </button>
        </div>
        {dispatchMsg && <p className="mt-2 text-sm text-stone-600">{dispatchMsg}</p>}
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "postcode", label: "Postcode" },
            { key: "window", label: "Window" },
            { key: "status", label: "Status" },
            { key: "provider", label: "Provider" },
          ]}
          rows={visits.map((v) => ({
            date: v.scheduledDate.slice(0, 10),
            postcode: v.postcode,
            window: v.availabilityWindow,
            status: v.status,
            provider: v.assignedProviderName ?? "—",
          }))}
          emptyMessage="No visits scheduled."
        />
      </section>

      <section>
        <h2 className="font-semibold">Escalations</h2>
        {escalations.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No open escalations.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {escalations.map((e) => (
              <li key={e.id} className="rounded-lg border bg-white p-4 text-sm shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={e.status} />
                  <span className="text-xs text-stone-400">
                    {new Date(e.createdAtUtc).toLocaleString("en-GB")}
                  </span>
                </div>
                <p className="mt-2 text-stone-700">{e.reason}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
