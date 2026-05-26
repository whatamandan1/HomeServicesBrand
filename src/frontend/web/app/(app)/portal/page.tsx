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
import { AlertBanner, LoadingSpinner, PageLoading } from "@/components/ui/feedback";
import { stashedPhotoToFile, takeSignupPhotos } from "@/lib/pending-signup-photos";

export default function PortalPage() {
  const { auth, ready } = useAuth();
  const [subs, setSubs] = useState<CustomerSubscription[]>([]);
  const [properties, setProperties] = useState<CustomerProperty[]>([]);
  const [visits, setVisits] = useState<JobVisit[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
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

    let cancelled = false;
    setLoading(true);
    setError(null);

    void Promise.allSettled([
      api.customerSubscriptions(auth.token),
      api.customerProperties(auth.token),
      api.customerVisits(auth.token),
    ]).then(([subsResult, propsResult, visitsResult]) => {
      if (cancelled) return;
      if (subsResult.status === "fulfilled") setSubs(subsResult.value);
      if (propsResult.status === "fulfilled") setProperties(propsResult.value);
      if (visitsResult.status === "fulfilled") setVisits(visitsResult.value);

      const failures = [subsResult, propsResult, visitsResult].filter(
        (r) => r.status === "rejected"
      );
      if (failures.length > 0) {
        const first = failures[0];
        setError(
          first.status === "rejected" && first.reason instanceof Error
            ? first.reason.message
            : "Could not load account data"
        );
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [auth]);

  useEffect(() => {
    if (!auth?.token || properties.length === 0) return;

    const stashed = takeSignupPhotos();
    if (stashed.length === 0) return;

    const primary = properties.find((p) => p.isPrimary) ?? properties[0];
    if (!primary) return;

    void (async () => {
      for (const item of stashed) {
        try {
          await api.customerUploadPropertyPhoto(
            auth.token,
            primary.id,
            await stashedPhotoToFile(item)
          );
        } catch {
          // Photos can be re-added manually in the portal if upload fails.
        }
      }
      api.customerProperties(auth.token).then(setProperties);
    })();
  }, [auth, properties]);

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

  if (!ready) return <PageLoading label="Checking session…" />;
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
            window.location.href = "/login";
          }}
          className="min-h-[44px] text-sm text-stone-500 hover:text-stone-800"
        >
          Logout
        </button>
      </div>

      {error && (
        <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <LoadingSpinner label="Loading your account…" className="block" />}

      {!loading && subs.some((s) => s.preferredGardenerName) && (
        <p className="rounded-xl border border-gardens-primary/15 bg-gardens-light/40 px-4 py-3 text-sm text-gardens-dark">
          Your regular gardener is{" "}
          <strong>{subs.find((s) => s.preferredGardenerName)?.preferredGardenerName}</strong>. We&apos;ll
          assign them to future visits when they&apos;re available in your area.
        </p>
      )}

      {!loading && auth?.token && (
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
        {loading ? (
          <LoadingSpinner label="Loading properties…" className="mt-3 block" />
        ) : (
        <PropertyList
          properties={properties}
          token={auth.token}
          onSave={async (id, body) => {
            if (!auth?.token) return;
            const updated = await api.customerUpdateProperty(auth.token, id, body);
            setProperties((list) => list.map((p) => (p.id === id ? updated : p)));
          }}
        />
        )}
      </section>

      <section>
        <h2 className="font-semibold text-gardens-dark">Upcoming visits</h2>
        <p className="mt-1 text-sm text-stone-500">
          Reschedule or cancel before your gardener starts the visit.
        </p>
        {loading ? (
          <LoadingSpinner label="Loading visits…" className="mt-3 block" />
        ) : (
        <VisitList
          visits={upcoming}
          busyId={busyId}
          onCancel={(id) => runVisitAction(id, "cancel")}
          onReschedule={(id, date) => runVisitAction(id, "reschedule", date)}
          emptyMessage="No visits scheduled yet."
        />
        )}
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
