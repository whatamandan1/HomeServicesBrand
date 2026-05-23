"use client";

import { useEffect, useState } from "react";
import { api, type CustomerProperty, type CustomerSubscription, type JobVisit } from "@/lib/api";
import { clearAuth } from "@/lib/auth-storage";
import { useAuth } from "@/lib/use-auth";
import { isActiveVisit } from "@/lib/visit-status";
import { BillingSection } from "@/components/billing/BillingSection";
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
  const [chatPrompt, setChatPrompt] = useState<{ key: number; text: string } | null>(null);

  function refreshVisits() {
    if (!auth?.token) return;
    api.customerVisits(auth.token).then(setVisits);
  }

  function refreshSubscriptions() {
    if (!auth?.token) return;
    api.customerSubscriptions(auth.token).then(setSubs);
  }

  useEffect(() => {
    if (!auth?.token || auth.role !== "Customer") return;
    api.customerSubscriptions(auth.token)
      .then(setSubs)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load subscriptions"));
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

      {auth?.token && (
        <BillingSection
          token={auth.token}
          subscriptions={subs}
          onError={setError}
          onSubscriptionUpdated={refreshSubscriptions}
          onContactSupport={(message) => {
            setChatPrompt({ key: Date.now(), text: message });
            document.getElementById("support-chat")?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      )}

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

      <section id="support-chat">
        <SupportChat
          token={auth.token}
          mode="customer"
          title="Customer service"
          subtitle="Ask about your plan, visits, or cancellation requests"
          emptyHint="Ask about your visits, plan, or billing — e.g. “When is my next visit?”"
          promptSeed={chatPrompt}
        />
      </section>
    </div>
  );
}
