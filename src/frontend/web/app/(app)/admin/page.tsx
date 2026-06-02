"use client";

import { useCallback, useEffect, useState } from "react";
import { api, type AdminCustomer, type AdminDashboard, type AdminJobVisit, type AdminProvider, type AiActionLog, type CommunicationThreadSummary, type Escalation, type PortfolioEnquirySummary, type SignupLeadSummary, type WorkflowEvent } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { DashboardTrends } from "@/components/admin/DashboardTrends";
import { CustomerDetailPanel } from "@/components/admin/CustomerDetailPanel";
import { PortfolioEnquiryList } from "@/components/admin/PortfolioEnquiryList";
import { SignupLeadList } from "@/components/admin/SignupLeadList";
import { ProviderDetailPanel } from "@/components/admin/ProviderDetailPanel";
import { ActAsUserButton } from "@/components/admin/ActAsUserButton";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import { StatCard } from "@/components/ui";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";
import { matchesSearch, useAdminListControls, withPinnedItem } from "@/lib/admin-list-controls";
import {
  AlertBanner,
  DashboardSkeleton,
  LoadingSpinner,
  PageLoading,
} from "@/components/ui/feedback";
import { isImpersonating } from "@/lib/auth-storage";
import { AdminVisitBoard } from "@/components/admin/AdminVisitBoard";
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
  activeSignupLeads: "Incomplete signups",
};

const DASH_SECTIONS: Record<string, string> = {
  customerCount: "customers",
  activeSubscriptions: "customers",
  providerCount: "providers",
  openVisits: "visits",
  openEscalations: "escalations",
  newPortfolioEnquiries: "multi-property-solutions",
  activeSignupLeads: "signup-leads",
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
  const [visits, setVisits] = useState<AdminJobVisit[]>([]);
  const [visitStatusFilter, setVisitStatusFilter] = useState("all");
  const [visitFromDate, setVisitFromDate] = useState("");
  const [visitToDate, setVisitToDate] = useState("");
  const [workflowRefreshing, setWorkflowRefreshing] = useState(false);
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
  const [signupLeads, setSignupLeads] = useState<SignupLeadSummary[]>([]);
  const [signupLeadsError, setSignupLeadsError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [visitLoadError, setVisitLoadError] = useState<string | null>(null);
  const [demoSeedBusy, setDemoSeedBusy] = useState(false);
  const [approvingProviderId, setApprovingProviderId] = useState<string | null>(null);

  function refreshVisits() {
    if (!auth?.token) return;
    const options: { fromDate?: string; toDate?: string; limit?: number } = { limit: 200 };
    if (visitFromDate) options.fromDate = `${visitFromDate}T00:00:00Z`;
    if (visitToDate) options.toDate = `${visitToDate}T23:59:59Z`;
    setVisitLoadError(null);
    api.adminVisits(auth.token, options)
      .then(setVisits)
      .catch((e) => {
        setVisits([]);
        setVisitLoadError(e instanceof Error ? e.message : "Could not load visits");
      });
    api.adminDashboard(auth.token, trendDays).then(setDash);
  }

  function openCustomerFromVisit(customerId: string) {
    setSelectedCustomerId(customerId);
    setSelectedProviderId(null);
    requestAnimationFrame(() => {
      document
        .getElementById(`customer-${customerId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function refreshWorkflowEvents(workflow?: string) {
    if (!auth?.token) return;
    setWorkflowRefreshing(true);
    api
      .adminWorkflowEvents(auth.token, workflow && workflow !== "all" ? workflow : undefined, 200)
      .then(setWorkflowEvents)
      .finally(() => setWorkflowRefreshing(false));
  }

  function refreshEscalations() {
    if (!auth?.token) return;
    api.adminEscalations(auth.token).then(setEscalations);
    api.adminDashboard(auth.token, trendDays).then(setDash);
  }

  async function runVisitAction(
    visitId: string,
    action: "cancel" | "reschedule" | "release" | "assign",
    payload?: string
  ) {
    if (!auth?.token) return;
    setBusyVisitId(visitId);
    setVisitError(null);
    try {
      if (action === "cancel") {
        await api.adminCancelVisit(auth.token, visitId);
      } else if (action === "reschedule") {
        await api.adminRescheduleVisit(auth.token, visitId, payload!);
      } else if (action === "release") {
        await api.adminReleaseVisit(auth.token, visitId);
        setDispatchNotice("Visit released back to the open pool.");
      } else {
        await api.adminAssignVisit(auth.token, visitId, payload!);
        setDispatchNotice("Visit assigned to gardener.");
      }
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
        api.adminVisits(auth.token, { limit: 200 }),
        api.adminEscalations(auth.token),
        api.adminWorkflowEvents(auth.token),
        api.adminAiActions(auth.token),
        api.adminCommunicationThreads(auth.token),
        api.adminPortfolioEnquiries(auth.token),
        api.adminSignupLeads(auth.token),
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
        signupLeadsResult,
      ] = results;

      if (dashResult.status === "fulfilled") setDash(dashResult.value);
      if (customersResult.status === "fulfilled") setCustomers(customersResult.value);
      if (providersResult.status === "fulfilled") setProviders(providersResult.value);
      if (visitsResult.status === "fulfilled") {
        setVisits(visitsResult.value);
        setVisitLoadError(null);
      } else if (visitsResult.status === "rejected") {
        setVisits([]);
        const reason = visitsResult.reason;
        setVisitLoadError(
          reason instanceof Error ? reason.message : "Could not load visits."
        );
      }
      if (escalationsResult.status === "fulfilled") setEscalations(escalationsResult.value);
      if (workflowResult.status === "fulfilled") setWorkflowEvents(workflowResult.value);
      if (aiResult.status === "fulfilled") setAiActionLogs(aiResult.value);
      if (threadsResult.status === "fulfilled") setCommunicationThreads(threadsResult.value);
      if (portfolioResult.status === "fulfilled") setPortfolioEnquiries(portfolioResult.value);
      if (signupLeadsResult.status === "fulfilled") {
        setSignupLeads(signupLeadsResult.value);
        setSignupLeadsError(null);
      } else if (signupLeadsResult.status === "rejected") {
        setSignupLeads([]);
        const reason = signupLeadsResult.reason;
        setSignupLeadsError(
          reason instanceof Error ? reason.message : "Could not load incomplete signups."
        );
      }

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
            : `${message} - some sections may be incomplete. Refresh to retry.`
        );
      }

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [auth, trendDays]);

  useEffect(() => {
    if (!auth?.token || auth.role !== "Admin") return;
    refreshVisits();
  }, [auth?.token, visitFromDate, visitToDate]);

  const approvedProviders = providers.filter((p) => p.isApproved);

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

  const searchCustomer = useCallback(
    (customer: AdminCustomer, query: string) =>
      matchesSearch(query, customer.name, customer.email, customer.createdAtUtc),
    []
  );
  const searchProvider = useCallback(
    (provider: AdminProvider, query: string) =>
      matchesSearch(
        query,
        provider.name,
        provider.email,
        provider.coveragePostcode,
        provider.coverageRadiusMiles,
        provider.isApproved ? "approved" : "pending",
        provider.coveredOutcodes?.join(" ")
      ),
    []
  );
  const searchVisit = useCallback(
    (visit: AdminJobVisit, query: string) =>
      matchesSearch(
        query,
        visit.scheduledDate,
        visit.postcode,
        visit.customerName,
        visit.availabilityWindow,
        visit.status,
        visit.assignedProviderName
      ),
    []
  );

  const customerControls = useAdminListControls(customers, searchCustomer);
  const providerControls = useAdminListControls(providers, searchProvider);
  const visitControls = useAdminListControls(visits, searchVisit);

  if (!ready) return <PageLoading label="Checking session…" />;
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
  const visibleCustomers = withPinnedItem(
    customerControls.pageItems,
    customerControls.filtered,
    selectedCustomerId
  );
  const visibleProviders = withPinnedItem(
    providerControls.pageItems,
    providerControls.filtered,
    selectedProviderId
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Operations CRM</h1>
        <p className="mt-1 text-sm text-stone-500">Manage customers, providers, visits, and support.</p>
      </div>

      <AdminSectionNav />

      {loading && (
        <div className="space-y-3">
          <LoadingSpinner label="Loading CRM data…" />
          <DashboardSkeleton />
        </div>
      )}
      {pageError && <AlertBanner variant="error" message={pageError} onDismiss={() => setPageError(null)} />}

      {!loading && dash && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-stone-500">Snapshot counts - click a card to jump to that section.</p>
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
                ["activeSignupLeads", dash.activeSignupLeads],
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

      {!loading && (
      <>
      <section id="signup-leads" className="scroll-mt-6">
        <h2 className="font-semibold">Incomplete signups</h2>
        <p className="mt-1 text-sm text-stone-500">
          Contact details captured on /signup - follow up if someone dropped off before payment.
        </p>
        {signupLeadsError && (
          <AlertBanner
            variant="error"
            message={signupLeadsError}
            onDismiss={() => setSignupLeadsError(null)}
            className="mt-3"
          />
        )}
        {auth?.token && (
          <button
            type="button"
            className="mt-2 text-sm font-medium text-gardens-primary hover:underline"
            onClick={() => {
              if (!auth.token) return;
              setSignupLeadsError(null);
              void api.adminSignupLeads(auth.token)
                .then((leads) => {
                  setSignupLeads(leads);
                  setSignupLeadsError(null);
                })
                .catch((e) => {
                  setSignupLeads([]);
                  setSignupLeadsError(e instanceof Error ? e.message : "Could not load incomplete signups.");
                });
            }}
          >
            Refresh incomplete signups
          </button>
        )}
        <div className="mt-3">
          <SignupLeadList leads={signupLeads} />
        </div>
      </section>

      <section id="multi-property-solutions" className="scroll-mt-6">
        <h2 className="font-semibold">Multi-Property Solutions</h2>
        <p className="mt-1 text-sm text-stone-500">Enquiry leads for multi-property accounts - separate from consumer customers.</p>
        {portfolioError && (
          <AlertBanner variant="error" message={portfolioError} onDismiss={() => setPortfolioError(null)} />
        )}
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
          <>
            <AdminListToolbar
              controls={providerControls}
              placeholder="Search name, email, postcode, coverage…"
              className="mt-3"
            />
            <ProviderCoverageMap
              providers={providerControls.filtered}
              emptyMessage={
                providerControls.query
                  ? "No providers match your search."
                  : "No provider coverage areas with coordinates yet."
              }
            />
          </>
        ) : (
        <div className="mt-2 space-y-2">
          <AdminListToolbar
            controls={providerControls}
            placeholder="Search name, email, postcode, coverage…"
          />
          {visibleProviders.length === 0 && providers.length > 0 ? (
            <p className="text-sm text-stone-500">No providers match your search.</p>
          ) : null}
          {visibleProviders.map((p) => (
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
                      : "-"}
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
          {providerError && (
            <AlertBanner variant="error" message={providerError} onDismiss={() => setProviderError(null)} />
          )}
          {providers.length === 0 && (
            <p className="text-sm text-stone-500">No providers yet.</p>
          )}
        </div>
        )}
      </section>

      <section id="customers" className="scroll-mt-6">
        <h2 className="font-semibold">Customers</h2>
        {customerError && (
          <AlertBanner variant="error" message={customerError} onDismiss={() => setCustomerError(null)} />
        )}
        <div className="mt-2 space-y-2">
          <AdminListToolbar
            controls={customerControls}
            placeholder="Search name or email…"
          />
          {visibleCustomers.length === 0 && customers.length > 0 ? (
            <p className="text-sm text-stone-500">No customers match your search.</p>
          ) : null}
          {visibleCustomers.map((c) => (
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
                  const result = await api.adminOpenDispatch(auth.token);
                  setDispatchNotice(
                    `Opened ${result.opened} visit${result.opened === 1 ? "" : "s"} for claiming` +
                      (result.autoAssigned > 0
                        ? ` (${result.autoAssigned} auto-assigned to preferred gardeners).`
                        : ".")
                  );
                  refreshVisits();
                } catch (e) {
                  setDispatchError(e instanceof Error ? e.message : "Dispatch failed");
                }
              }}
            >
              Open visits for dispatch
            </button>
            {visits.length === 0 && (
              <button
                type="button"
                disabled={demoSeedBusy}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                onClick={async () => {
                  if (!auth?.token) return;
                  setDemoSeedBusy(true);
                  setVisitLoadError(null);
                  try {
                    const result = await api.adminEnsureDemoData(auth.token);
                    setDispatchNotice(
                      `${result.message} ${result.visitCount} total visits (${result.openCount} open for claim).`
                    );
                    refreshVisits();
                  } catch (e) {
                    setVisitLoadError(e instanceof Error ? e.message : "Could not seed demo visits");
                  } finally {
                    setDemoSeedBusy(false);
                  }
                }}
              >
                {demoSeedBusy ? "Seeding…" : "Seed demo visits"}
              </button>
            )}
          </div>
          <ListMapToggle value={visitView} onChange={setVisitView} />
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="font-medium text-stone-700">From</span>
            <input
              type="date"
              value={visitFromDate}
              onChange={(e) => setVisitFromDate(e.target.value)}
              className="field-input mt-1 block"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium text-stone-700">To</span>
            <input
              type="date"
              value={visitToDate}
              onChange={(e) => setVisitToDate(e.target.value)}
              className="field-input mt-1 block"
            />
          </label>
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            onClick={() => {
              setVisitFromDate("");
              setVisitToDate("");
            }}
          >
            Clear dates
          </button>
          <button
            type="button"
            className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            onClick={refreshVisits}
          >
            Refresh visits
          </button>
        </div>
        {dispatchNotice && (
          <AlertBanner variant="success" message={dispatchNotice} onDismiss={() => setDispatchNotice(null)} />
        )}
        {dispatchError && (
          <AlertBanner variant="error" message={dispatchError} onDismiss={() => setDispatchError(null)} />
        )}
        {visitLoadError && (
          <AlertBanner variant="error" message={visitLoadError} onDismiss={() => setVisitLoadError(null)} />
        )}
        {visitError && (
          <AlertBanner variant="error" message={visitError} onDismiss={() => setVisitError(null)} />
        )}
        {visitView === "map" ? (
          <>
            <AdminListToolbar
              controls={visitControls}
              placeholder="Search postcode, gardener, status, date…"
              className="mt-2"
            />
            <VisitMap
              visits={visitControls.filtered}
              className="mt-2"
              emptyMessage={
                visitControls.query
                  ? "No visits match your search."
                  : "No visits with map coordinates yet."
              }
            />
          </>
        ) : (
        <AdminVisitBoard
          visits={visits}
          statusFilter={visitStatusFilter}
          onStatusFilterChange={setVisitStatusFilter}
          busyId={busyVisitId}
          approvedProviders={approvedProviders}
          onCancel={(id) => runVisitAction(id, "cancel")}
          onReschedule={(id, date) => runVisitAction(id, "reschedule", date)}
          onRelease={(id) => runVisitAction(id, "release")}
          onAssignProvider={(id, providerId) => runVisitAction(id, "assign", providerId)}
          onViewCustomer={openCustomerFromVisit}
        />
        )}
      </section>

      <section id="escalations" className="scroll-mt-6">
        <h2 className="font-semibold">Escalations</h2>
        <p className="mt-1 text-sm text-stone-500">
          Take open cases, then mark resolved when handled.
        </p>
        {escalationError && (
          <AlertBanner variant="error" message={escalationError} onDismiss={() => setEscalationError(null)} />
        )}
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
          Recent platform events - signup, billing, scheduling, dispatch, and support.
        </p>
        <WorkflowEventList
          events={workflowEvents}
          refreshing={workflowRefreshing}
          onRefresh={() => refreshWorkflowEvents()}
          onWorkflowFilterChange={(workflow) => refreshWorkflowEvents(workflow)}
        />
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
          Customer and guest chat threads - click View to read the full conversation.
        </p>
        <CommunicationThreadList
          threads={communicationThreads}
          loadThread={(id) => api.adminCommunicationThread(auth!.token, id)}
        />
      </section>
      </>
      )}
    </div>
  );
}
