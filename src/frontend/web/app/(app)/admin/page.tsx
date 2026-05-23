"use client";

import { useEffect, useState } from "react";
import { api, type AdminCustomer, type AdminProvider, type AiActionLog, type CommunicationThreadSummary, type Escalation, type JobVisit, type WorkflowEvent } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { CustomerDetailPanel } from "@/components/admin/CustomerDetailPanel";
import { StatCard } from "@/components/ui";
import { VisitList } from "@/components/visits/VisitList";
import { EscalationList } from "@/components/escalations/EscalationList";
import { WorkflowEventList } from "@/components/workflow/WorkflowEventList";
import { AiActionLogList } from "@/components/ai/AiActionLogList";
import { CommunicationThreadList } from "@/components/ai/CommunicationThreadList";
import { ListMapToggle, type ViewMode } from "@/components/map/ListMapToggle";
import { ProviderCoverageMap } from "@/components/map/ProviderCoverageMap";
import { VisitMap } from "@/components/map/VisitMap";

const DASH_LABELS: Record<string, string> = {
  customerCount: "Customers",
  activeSubscriptions: "Active subs",
  providerCount: "Providers",
  openVisits: "Open visits",
  openEscalations: "Escalations",
};

const DASH_SECTIONS: Record<string, string> = {
  customerCount: "customers",
  activeSubscriptions: "customers",
  providerCount: "providers",
  openVisits: "visits",
  openEscalations: "escalations",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AdminPage() {
  const { auth, ready } = useAuth();
  const [dash, setDash] = useState<Record<string, number> | null>(null);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [visits, setVisits] = useState<JobVisit[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>([]);
  const [aiActionLogs, setAiActionLogs] = useState<AiActionLog[]>([]);
  const [communicationThreads, setCommunicationThreads] = useState<CommunicationThreadSummary[]>([]);
  const [dispatchMsg, setDispatchMsg] = useState<string | null>(null);
  const [visitError, setVisitError] = useState<string | null>(null);
  const [busyVisitId, setBusyVisitId] = useState<string | null>(null);
  const [escalationError, setEscalationError] = useState<string | null>(null);
  const [busyEscalationId, setBusyEscalationId] = useState<string | null>(null);
  const [providerView, setProviderView] = useState<ViewMode>("list");
  const [visitView, setVisitView] = useState<ViewMode>("list");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  function refreshVisits() {
    if (!auth?.token) return;
    api.adminVisits(auth.token).then(setVisits);
    api.adminDashboard(auth.token).then(setDash);
  }

  function refreshEscalations() {
    if (!auth?.token) return;
    api.adminEscalations(auth.token).then(setEscalations);
    api.adminDashboard(auth.token).then(setDash);
  }

  async function runVisitAction(
    visitId: string,
    action: "cancel" | "reschedule",
    scheduledDate?: string
  ) {
    if (!auth?.token) return;
    setBusyVisitId(visitId);
    setVisitError(null);
    try {
      const updated =
        action === "cancel"
          ? await api.adminCancelVisit(auth.token, visitId)
          : await api.adminRescheduleVisit(auth.token, visitId, scheduledDate!);
      setVisits((list) => list.map((v) => (v.id === visitId ? updated : v)));
      refreshVisits();
    } catch (e) {
      setVisitError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyVisitId(null);
    }
  }

  async function runEscalationAction(
    id: string,
    action: "start" | "resolve",
    notes?: string
  ) {
    if (!auth?.token) return;
    setBusyEscalationId(id);
    setEscalationError(null);
    try {
      const updated =
        action === "start"
          ? await api.adminStartEscalation(auth.token, id)
          : await api.adminResolveEscalation(auth.token, id, notes);
      setEscalations((list) => list.map((e) => (e.id === id ? updated : e)));
      refreshEscalations();
    } catch (e) {
      setEscalationError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyEscalationId(null);
    }
  }

  useEffect(() => {
    if (!auth?.token || auth.role !== "Admin") return;
    api.adminDashboard(auth.token).then(setDash);
    api.adminCustomers(auth.token).then(setCustomers);
    api.adminProviders(auth.token).then(setProviders);
    api.adminVisits(auth.token).then(setVisits);
    api.adminEscalations(auth.token).then(setEscalations);
    api.adminWorkflowEvents(auth.token).then(setWorkflowEvents);
    api.adminAiActions(auth.token).then(setAiActionLogs);
    api.adminCommunicationThreads(auth.token).then(setCommunicationThreads);
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
        <a href="/login" className="underline">Sign in</a> with an admin account.
      </p>
    );
  }

  const activeEscalations = escalations.filter((e) => e.status !== "Resolved");
  const resolvedEscalations = escalations.filter((e) => e.status === "Resolved");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Operations CRM</h1>

      {dash && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {Object.entries(dash).map(([k, v]) => (
            <StatCard
              key={k}
              label={DASH_LABELS[k] ?? k}
              value={v}
              onClick={
                DASH_SECTIONS[k]
                  ? () => scrollToSection(DASH_SECTIONS[k])
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <section id="providers" className="scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">Providers</h2>
          <ListMapToggle value={providerView} onChange={setProviderView} />
        </div>
        {providerView === "map" ? (
          <ProviderCoverageMap
            providers={providers}
            emptyMessage="No provider coverage areas with coordinates yet."
          />
        ) : (
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
                  Coverage:{" "}
                  {p.coveragePostcode
                    ? `${p.coveragePostcode}, ${p.coverageRadiusMiles} miles`
                    : "—"}
                  {p.coveredOutcodes?.length ? (
                    <span className="block text-stone-400">
                      {p.coveredOutcodes.slice(0, 12).join(", ")}
                      {p.coveredOutcodes.length > 12
                        ? ` +${p.coveredOutcodes.length - 12} more`
                        : ""}
                    </span>
                  ) : null}
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
        )}
      </section>

      <section id="customers" className="scroll-mt-6">
        <h2 className="font-semibold">Customers</h2>
        <div className="mt-2 space-y-2">
          {customers.map((c) => (
            <div key={c.id} id={`customer-${c.id}`} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3 text-sm shadow-sm">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-stone-500">{c.email}</div>
                  <div className="text-xs text-stone-400">
                    Joined {new Date(c.createdAtUtc).toLocaleDateString("en-GB")}
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                  onClick={() => {
                    setSelectedCustomerId((current) => {
                      const next = current === c.id ? null : c.id;
                      if (next) {
                        requestAnimationFrame(() => {
                          document
                            .getElementById(`customer-${c.id}`)
                            ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                        });
                      }
                      return next;
                    });
                  }}
                >
                  {selectedCustomerId === c.id ? "Hide" : "View"}
                </button>
              </div>
              {selectedCustomerId === c.id && auth?.token && (
                <CustomerDetailPanel
                  customerId={c.id}
                  token={auth.token}
                  onClose={() => setSelectedCustomerId(null)}
                  onUpdated={() => {
                    api.adminDashboard(auth.token).then(setDash);
                    api.adminCustomers(auth.token).then(setCustomers);
                  }}
                />
              )}
            </div>
          ))}
          {customers.length === 0 && (
            <p className="text-sm text-stone-500">No customers yet.</p>
          )}
        </div>
      </section>

      <section id="visits" className="scroll-mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
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
          <ListMapToggle value={visitView} onChange={setVisitView} />
        </div>
        {dispatchMsg && <p className="mt-2 text-sm text-stone-600">{dispatchMsg}</p>}
        {visitError && <p className="mt-2 text-sm text-red-600">{visitError}</p>}
        {visitView === "map" ? (
          <VisitMap
            visits={visits}
            className="mt-2"
            emptyMessage="No visits with map coordinates yet."
          />
        ) : (
        <VisitList
          visits={visits}
          busyId={busyVisitId}
          allowInProgress
          onCancel={(id) => runVisitAction(id, "cancel")}
          onReschedule={(id, date) => runVisitAction(id, "reschedule", date)}
          emptyMessage="No visits scheduled."
        />
        )}
      </section>

      <section id="escalations" className="scroll-mt-6">
        <h2 className="font-semibold">Escalations</h2>
        <p className="mt-1 text-sm text-stone-500">
          Take open cases, then mark resolved when handled.
        </p>
        {escalationError && <p className="mt-2 text-sm text-red-600">{escalationError}</p>}
        <EscalationList
          escalations={activeEscalations}
          busyId={busyEscalationId}
          onStart={(id) => runEscalationAction(id, "start")}
          onResolve={(id, notes) => runEscalationAction(id, "resolve", notes)}
          emptyMessage="No open escalations."
        />
      </section>

      {resolvedEscalations.length > 0 && (
        <section>
          <h2 className="font-semibold">Resolved escalations</h2>
          <EscalationList
            escalations={resolvedEscalations}
            busyId={null}
            readOnly
            onStart={async () => {}}
            onResolve={async () => {}}
            emptyMessage="No resolved escalations."
          />
        </section>
      )}

      <section id="workflow" className="scroll-mt-6">
        <h2 className="font-semibold">Workflow log</h2>
        <p className="mt-1 text-sm text-stone-500">
          Recent platform events — signup, billing, scheduling, dispatch, and support.
        </p>
        <WorkflowEventList events={workflowEvents} />
      </section>

      <section id="ai-log" className="scroll-mt-6">
        <h2 className="font-semibold">AI action log</h2>
        <p className="mt-1 text-sm text-stone-500">
          Support and website chat prompts, responses, confidence scores, and escalations.
        </p>
        <AiActionLogList logs={aiActionLogs} />
      </section>

      <section id="threads" className="scroll-mt-6">
        <h2 className="font-semibold">Communication threads</h2>
        <p className="mt-1 text-sm text-stone-500">
          Customer and guest chat threads — click View to read the full conversation.
        </p>
        <CommunicationThreadList
          threads={communicationThreads}
          loadThread={(id) => api.adminCommunicationThread(auth!.token, id)}
        />
      </section>
    </div>
  );
}
