"use client";

import { useEffect, useState } from "react";
import { api, type AdminCustomer, type AdminDashboard, type AdminProvider, type AiActionLog, type CommunicationThreadSummary, type Escalation, type JobVisit, type PortfolioEnquirySummary, type WorkflowEvent } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { DashboardTrends } from "@/components/admin/DashboardTrends";
import { CustomerDetailPanel } from "@/components/admin/CustomerDetailPanel";
import { PortfolioEnquiryList } from "@/components/admin/PortfolioEnquiryList";
import { ProviderDetailPanel } from "@/components/admin/ProviderDetailPanel";
import { ActAsUserButton } from "@/components/admin/ActAsUserButton";
import { StatCard } from "@/components/ui";
import { isImpersonating } from "@/lib/auth-storage";
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
  newPortfolioEnquiries: "Multi-property leads",
};

const DASH_SECTIONS: Record<string, string> = {
  customerCount: "customers",
  activeSubscriptions: "customers",
  providerCount: "providers",
  openVisits: "visits",
  openEscalations: "escalations",
  newPortfolioEnquiries: "multi-property-solutions",
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function AdminPage() {
  const { auth, ready } = useAuth();
  const [dash, setDash] = useState<AdminDashboard | null>(null);
  const [trendDays, setTrendDays] = useState(30);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [visits, setVisits] = useState<JobVisit[]>([]);
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>([]);
  const [aiActionLogs, setAiActionLogs] = useState<AiActionLog[]>([]);
  const [communicationThreads, setCommunicationThreads] = useState<CommunicationThreadSummary[]>([]);
  const [visitError, setVisitError] = useState<string | null>(null);
  const [busyVisitId, setBusyVisitId] = useState<string | null>(null);
  const [escalationError, setEscalationError] = useState<string | null>(null);
  const [busyEscalationId, setBusyEscalationId] = useState<string | null>(null);
  const [providerView, setProviderView] = useState<ViewMode>("list");
  const [visitView, setVisitView] = useState<ViewMode>("list");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [customerError, setCustomerError] = useState<string | null>(null);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [portfolioEnquiries, setPortfolioEnquiries] = useState<PortfolioEnquirySummary[]>([]);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [approvingProviderId, setApprovingProviderId] = useState<string | null>(null);

  function refreshVisits() {
    if (!auth?.token) return;
    api.adminVisits(auth.token).then(setVisits);
    api.adminDashboard(auth.token, trendDays).then(setDash);
  }

  function refreshEscalations() {
    if (!auth?.token) return;
    api.adminEscalations(auth.token).then(setEscalations);
    api.adminDashboard(auth.token, trendDays).then(setDash);
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

    let cancelled = false;
    setLoading(true);
    setPageError(null);

    void (async () => {
      const results = await Promise.allSettled([
        api.adminDashboard(auth.token, trendDays),
        api.adminCustomers(auth.token),
        api.adminProviders(auth.token),
        api.adminVisits(auth.token),
        api.adminEscalations(auth.token),
        api.adminWorkflowEvents(auth.token),
        api.adminAiActions(auth.token),
        api.adminCommunicationThreads(auth.token),
        api.adminPortfolioEnquiries(auth.token),
      ]);

      if (cancelled) return;

      const [
        dashResult,
        customersResult,
        providersResult,
        visitsResult,
        escalationsResult,
        workflowResult,
        aiResult,
        threadsResult,
        portfolioResult,
      ] = results;

      if (dashResult.status === "fulfilled") setDash(dashResult.value);
      if (customersResult.status === "fulfilled") setCustomers(customersResult.value);
      if (providersResult.status === "fulfilled") setProviders(providersResult.value);
      if (visitsResult.status === "fulfilled") setVisits(visitsResult.value);
      if (escalationsResult.status === "fulfilled") setEscalations(escalationsResult.value);
      if (workflowResult.status === "fulfilled") setWorkflowEvents(workflowResult.value);
      if (aiResult.status === "fulfilled") setAiActionLogs(aiResult.value);
      if (threadsResult.status === "fulfilled") setCommunicationThreads(threadsResult.value);
      if (portfolioResult.status === "fulfilled") setPortfolioEnquiries(portfolioResult.value);

      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        const first = failures[0];
        const message =
          first.status === "rejected" && first.reason instanceof Error
            ? first.reason.message
            : "Could not load CRM data";
        setPageError(
          failures.length === results.length
            ? message
            : `${message} — some sections may be incomplete. Refresh to retry.`
        );
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [auth, trendDays]);

  async function approveProvider(providerId: string) {
    if (!auth?.token) return;
    setApprovingProviderId(providerId);
    setProviderError(null);
    try {
      await api.approveProvider(auth.token, providerId);
      setProviders(await api.adminProviders(auth.token));
    } catch (e) {
      setProviderError(e instanceof Error ? e.message : "Approval failed");
    } finally {
      setApprovingProviderId(null);
    }
  }

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

      {loading && <p className="text-sm text-stone-500">Loading CRM data…</p>}
      {pageError && <p className="text-sm text-red-600">{pageError}</p>}

      {dash && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500">Snapshot counts — click a card to jump to that section.</p>
            <label className="text-sm text-stone-600">
              Trend range
              <select
                value={trendDays}
                onChange={(e) => setTrendDays(Number(e.target.value))}
                className="field-input ml-2 inline-block w-auto py-1.5"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {(
              [
                ["customerCount", dash.customerCount],
                ["activeSubscriptions", dash.activeSubscriptions],
                ["providerCount", dash.providerCount],
                ["openVisits", dash.openVisits],
                ["openEscalations", dash.openEscalations],
                ["newPortfolioEnquiries", dash.newPortfolioEnquiries],
              ] as const
            ).map(([k, v]) => (
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
          <DashboardTrends trends={dash.trends} />
        </>
      )}

      <section id="multi-property-solutions" className="scroll-mt-6">
        <h2 className="font-semibold">Multi-Property Solutions</h2>
        <p className="mt-1 text-sm text-stone-500">Enquiry leads for multi-property accounts — separate from consumer customers.</p>
        {portfolioError && <p className="mt-2 text-sm text-red-600">{portfolioError}</p>}
        <div className="mt-3">
          {auth?.token && (
            <PortfolioEnquiryList
              token={auth.token}
              enquiries={portfolioEnquiries}
              onRefresh={() => {
                api.adminPortfolioEnquiries(auth.token).then(setPortfolioEnquiries);
                api.adminDashboard(auth.token, trendDays).then(setDash);
              }}
              onError={setPortfolioError}
            />
          )}
        </div>
      </section>

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
            <div key={p.id} id={`provider-${p.id}`} className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3 text-sm shadow-sm">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-stone-500">{p.email}</div>
                  <div className="text-xs text-stone-400">
                    {p.isApproved ? (
                      <span className="text-green-700">Approved</span>
                    ) : (
                      <span className="text-amber-700">Pending approval</span>
                    )}
                    {" · "}
                    Coverage:{" "}
                    {p.coveragePostcode
                      ? `${p.coveragePostcode}, ${p.coverageRadiusMiles} miles`
                      : "—"}
                    {p.coveredOutcodes?.length ? (
                      <span className="block text-stone-400">
                        {p.coveredOutcodes.slice(0, 8).join(", ")}
                        {p.coveredOutcodes.length > 8
                          ? ` +${p.coveredOutcodes.length - 8} more`
                          : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                    onClick={() => {
                      setSelectedProviderId((current) => {
                        const next = current === p.id ? null : p.id;
                        if (next) {
                          setSelectedCustomerId(null);
                          requestAnimationFrame(() => {
                            document
                              .getElementById(`provider-${p.id}`)
                              ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
                          });
                        }
                        return next;
                      });
                    }}
                  >
                    {selectedProviderId === p.id ? "Hide" : "View"}
                  </button>
                  {!p.isApproved && (
                    <button
                      type="button"
                      className="rounded bg-gardens-primary px-3 py-1 text-white disabled:opacity-50"
                      disabled={approvingProviderId === p.id}
                      onClick={() => approveProvider(p.id)}
                    >
                      {approvingProviderId === p.id ? "Approving…" : "Approve"}
                    </button>
                  )}
                  {auth && auth.role === "Admin" && !isImpersonating(auth) && (
                    <ActAsUserButton
                      adminAuth={auth}
                      userId={p.userId}
                      label="Act as"
                      onError={setProviderError}
                    />
                  )}
                </div>
              </div>
              {selectedProviderId === p.id && auth?.token && (
                <ProviderDetailPanel
                  provider={p}
                  token={auth.token}
                  adminAuth={auth}
                  onClose={() => setSelectedProviderId(null)}
                  onUpdated={(updated) => {
                    setProviders((list) =>
                      list.map((item) => (item.id === updated.id ? updated : item))
                    );
                  }}
                  onError={setProviderError}
                />
              )}
            </div>
          ))}
          {providerError && <p className="text-sm text-red-600">{providerError}</p>}
          {providers.length === 0 && (
            <p className="text-sm text-stone-500">No providers yet.</p>
          )}
        </div>
        )}
      </section>

      <section id="customers" className="scroll-mt-6">
        <h2 className="font-semibold">Customers</h2>
        {customerError && <p className="mt-2 text-sm text-red-600">{customerError}</p>}
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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                    onClick={() => {
                      setSelectedCustomerId((current) => {
                        const next = current === c.id ? null : c.id;
                        if (next) {
                          setSelectedProviderId(null);
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
                  {auth && auth.role === "Admin" && !isImpersonating(auth) && (
                    <ActAsUserButton
                      adminAuth={auth}
                      userId={c.userId}
                      label="Act as"
                      onError={setCustomerError}
                    />
                  )}
                </div>
              </div>
              {selectedCustomerId === c.id && auth?.token && (
                <CustomerDetailPanel
                  customerId={c.id}
                  customerUserId={c.userId}
                  token={auth.token}
                  adminAuth={auth}
                  onClose={() => setSelectedCustomerId(null)}
                  onError={setCustomerError}
                  onUpdated={() => {
                    api.adminDashboard(auth.token, trendDays).then(setDash);
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
                setDispatchNotice(null);
                setDispatchError(null);
                try {
                  await api.adminOpenDispatch(auth.token);
                  setDispatchNotice("Scheduled visits opened for provider claiming.");
                  refreshVisits();
                } catch (e) {
                  setDispatchError(e instanceof Error ? e.message : "Dispatch failed");
                }
              }}
            >
              Open visits for dispatch
            </button>
          </div>
          <ListMapToggle value={visitView} onChange={setVisitView} />
        </div>
        {dispatchNotice && (
          <p className="mt-2 text-sm text-green-800">{dispatchNotice}</p>
        )}
        {dispatchError && <p className="mt-2 text-sm text-red-600">{dispatchError}</p>}
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
