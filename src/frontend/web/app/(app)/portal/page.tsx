"use client";

import { useEffect, useState } from "react";
import { api, type CustomerProperty, type CustomerSubscription, type JobVisit } from "@/lib/api";
import { clearAuth } from "@/lib/auth-storage";
import { useAuth } from "@/lib/use-auth";
import { isActiveVisit } from "@/lib/visit-status";
import { StatusBadge } from "@/components/ui";
import { VisitList } from "@/components/visits/VisitList";
import { SupportChat } from "@/components/support/SupportChat";
import { PropertyList } from "@/components/properties/PropertyList";

export default function PortalPage() {
  const { auth, setAuth, ready } = useAuth();
  const [subs, setSubs] = useState<CustomerSubscription[]>([]);
  const [properties, setProperties] = useState<CustomerProperty[]>([]);
  const [visits, setVisits] = useState<JobVisit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busySubId, setBusySubId] = useState<string | null>(null);

  function refreshVisits() {
    if (!auth?.token) return;
    api.customerVisits(auth.token).then(setVisits);
  }

  useEffect(() => {
    if (!auth?.token || auth.role !== "Customer") return;
    api.customerSubscriptions(auth.token).then(setSubs);
    api.customerProperties(auth.token).then(setProperties);
    refreshVisits();
  }, [auth]);

  async function runVisitAction(
    visitId: string,
    action: "cancel" | "reschedule",
    scheduledDate?: string
  ) {
    if (!auth?.token) return;
    setBusyId(visitId);
    setError(null);
    try {
      const updated =
        action === "cancel"
          ? await api.customerCancelVisit(auth.token, visitId)
          : await api.customerRescheduleVisit(auth.token, visitId, scheduledDate!);
      setVisits((list) => list.map((v) => (v.id === visitId ? updated : v)));
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
        Please <a href="/login" className="text-gardens-primary underline">login</a> as a customer.
      </p>
    );
  }
  if (auth.role !== "Customer") {
    return (
      <p>
        You are logged in as <strong>{auth.role}</strong>.{" "}
        <a href="/login" className="underline">Sign in</a> as a customer.
      </p>
    );
  }

  const upcoming = visits.filter((v) => isActiveVisit(v.status));
  const past = visits.filter((v) => !isActiveVisit(v.status));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gardens-dark">My account</h1>
          <p className="mt-1 text-sm text-stone-500">{auth.email}</p>
        </div>
        <button
          onClick={() => {
            clearAuth();
            setAuth(null);
          }}
          className="min-h-[44px] text-sm text-stone-500 hover:text-stone-800"
        >
          Logout
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <section>
        <h2 className="font-semibold text-gardens-dark">Subscriptions</h2>
        {subs.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No subscriptions yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {subs.map((s) => (
              <li key={s.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.planName}</span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  Availability: {s.availabilityPreference}
                </p>
                {s.startedAtUtc && (
                  <p className="text-xs text-stone-400">
                    Since {new Date(s.startedAtUtc).toLocaleDateString("en-GB")}
                  </p>
                )}
                {s.minimumTermEndsAtUtc && (
                  <p className="mt-1 text-xs text-stone-500">
                    Minimum term until{" "}
                    {new Date(s.minimumTermEndsAtUtc).toLocaleDateString("en-GB")}
                  </p>
                )}
                {s.cancelsAtUtc && (
                  <p className="mt-1 text-xs text-amber-700">
                    Cancels on {new Date(s.cancelsAtUtc).toLocaleDateString("en-GB")}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.canManageBilling && (
                    <button
                      type="button"
                      disabled={busySubId === s.id}
                      className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                      onClick={async () => {
                        if (!auth?.token) return;
                        setBusySubId(s.id);
                        setError(null);
                        try {
                          const { url } = await api.customerBillingPortal(auth.token, s.id);
                          window.location.href = url;
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Could not open billing portal");
                        } finally {
                          setBusySubId(null);
                        }
                      }}
                    >
                      Manage billing
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-gardens-dark">My property</h2>
        <p className="mt-1 text-sm text-stone-500">
          Update your address, garden size, and access notes for your gardener.
        </p>
        <PropertyList
          properties={properties}
          onSave={async (id, body) => {
            if (!auth?.token) return;
            const updated = await api.customerUpdateProperty(auth.token, id, body);
            setProperties((list) => list.map((p) => (p.id === id ? updated : p)));
          }}
        />
      </section>

      <section>
        <h2 className="font-semibold text-gardens-dark">Upcoming visits</h2>
        <p className="mt-1 text-sm text-stone-500">
          Reschedule or cancel before your gardener starts the visit.
        </p>
        <VisitList
          visits={upcoming}
          busyId={busyId}
          onCancel={(id) => runVisitAction(id, "cancel")}
          onReschedule={(id, date) => runVisitAction(id, "reschedule", date)}
          emptyMessage="No visits scheduled yet."
        />
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-semibold text-gardens-dark">Past visits</h2>
          <VisitList
            visits={past}
            busyId={null}
            readOnly
            onCancel={async () => {}}
            onReschedule={async () => {}}
            emptyMessage="No past visits."
          />
        </section>
      )}

      <section>
        <SupportChat token={auth.token} mode="customer" />
      </section>
    </div>
  );
}
