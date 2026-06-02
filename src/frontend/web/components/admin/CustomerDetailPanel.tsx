"use client";

import { useEffect, useState } from "react";
import { AdminCustomerPrivacyActions } from "@/components/admin/AdminCustomerPrivacyActions";
import { AdminPropertyPhotos } from "@/components/admin/AdminPropertyPhotos";
import { AdminPropertyEditor } from "@/components/admin/AdminPropertyEditor";
import { ActAsUserButton } from "@/components/admin/ActAsUserButton";
import { CommunicationThreadList } from "@/components/ai/CommunicationThreadList";
import { api, type AdminCustomerDetail, type AuthResponse, type CommunicationThreadSummary } from "@/lib/api";
import { StatusBadge } from "@/components/ui";

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("en-GB");
}

export function CustomerDetailPanel({
  customerId,
  customerUserId,
  token,
  adminAuth,
  onClose,
  onUpdated,
  onError,
}: {
  customerId: string;
  customerUserId: string;
  token: string;
  adminAuth: AuthResponse;
  onClose: () => void;
  onUpdated?: () => void;
  onError?: (message: string) => void;
}) {
  const [detail, setDetail] = useState<AdminCustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busySubId, setBusySubId] = useState<string | null>(null);
  const [threads, setThreads] = useState<CommunicationThreadSummary[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);
  const [savingPropertyId, setSavingPropertyId] = useState<string | null>(null);

  async function reloadDetail() {
    setLoading(true);
    setError(null);
    try {
      const refreshed = await api.adminCustomerDetail(token, customerId);
      setDetail(refreshed);
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .adminCustomerDetail(token, customerId)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load customer"))
      .finally(() => setLoading(false));
  }, [customerId, token]);

  useEffect(() => {
    setThreadsLoading(true);
    setThreadsError(null);
    api
      .adminCustomerCommunicationThreads(token, customerId)
      .then(setThreads)
      .catch((e) => {
        setThreads([]);
        setThreadsError(e instanceof Error ? e.message : "Failed to load chat history");
      })
      .finally(() => setThreadsLoading(false));
  }, [customerId, token]);

  async function cancelSubscription(subscriptionId: string) {
    if (
      !window.confirm(
        "Schedule cancellation for this subscription? Access continues until the minimum term or billing period ends."
      )
    ) {
      return;
    }

    setBusySubId(subscriptionId);
    setError(null);
    setMessage(null);
    try {
      const result = await api.adminCancelSubscription(token, subscriptionId);
      setMessage(result.message);
      const refreshed = await api.adminCustomerDetail(token, customerId);
      setDetail(refreshed);
      onUpdated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancellation failed");
    } finally {
      setBusySubId(null);
    }
  }

  return (
    <div className="rounded-xl border border-gardens-primary/20 bg-gardens-light/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold text-gardens-dark">Customer detail</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => void reloadDetail()}
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <ActAsUserButton
              adminAuth={adminAuth}
              userId={detail?.userId ?? customerUserId}
              label="Act as customer"
              onError={onError}
            />
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-stone-500 hover:text-stone-800"
          >
            Close
          </button>
        </div>
      </div>

      {loading && <p className="mt-3 text-sm text-stone-500">Loading…</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-800">{message}</p>}

      {detail && !loading && (
        <div className="mt-4 space-y-6">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-stone-500">Name</span>
              <p className="font-medium">{detail.name}</p>
            </div>
            <div>
              <span className="text-stone-500">Email</span>
              <p className="font-medium">{detail.email}</p>
            </div>
            <div>
              <span className="text-stone-500">Phone</span>
              <p className="font-medium">{detail.phone ?? "-"}</p>
            </div>
            <div>
              <span className="text-stone-500">Joined</span>
              <p className="font-medium">{formatDate(detail.createdAtUtc)}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gardens-dark">Subscriptions</h4>
            {detail.subscriptions.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">No subscriptions.</p>
            ) : (
              <ul className="mt-2 space-y-3">
                {detail.subscriptions.map((s) => (
                  <li key={s.id} className="rounded-lg border bg-white p-4 text-sm shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{s.planName}</span>
                      <StatusBadge status={s.status} />
                      {s.hasStripeBilling && (
                        <span className="text-xs text-stone-400">Stripe</span>
                      )}
                    </div>
                    <p className="mt-1 text-stone-600">Started {formatDate(s.startedAtUtc)}</p>
                    {s.availabilityPreference && (
                      <p className="mt-1 text-stone-600">
                        Preferred times: {s.availabilityPreference}
                      </p>
                    )}
                    {s.preferredGardenerName && (
                      <p className="mt-1 text-stone-600">
                        Preferred gardener: {s.preferredGardenerName}
                      </p>
                    )}
                    {s.minimumTermEndsAtUtc && (
                      <p className="text-xs text-stone-500">
                        Minimum term until {formatDate(s.minimumTermEndsAtUtc)}
                      </p>
                    )}
                    {s.cancelsAtUtc && (
                      <p className="text-xs text-amber-700">
                        Cancels on {formatDate(s.cancelsAtUtc)}
                      </p>
                    )}
                    {s.canCancel && (
                      <button
                        type="button"
                        disabled={busySubId === s.id}
                        className="mt-3 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                        onClick={() => cancelSubscription(s.id)}
                      >
                        Cancel subscription
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gardens-dark">Properties</h4>
            {detail.properties.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">No properties.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {detail.properties.map((p) => (
                  <li key={p.id} className="rounded-lg border bg-white p-3 text-sm">
                    <p className="font-medium">
                      {p.line1}
                      {p.line2 ? `, ${p.line2}` : ""}
                    </p>
                    <p className="text-stone-600">
                      {p.city}, {p.postcode}
                    </p>
                    <p className="text-xs text-stone-500">
                      Garden: {p.gardenSize}
                      {p.isPrimary ? " · Primary" : ""}
                      {(p.photoCount ?? 0) > 0 ? ` · ${p.photoCount} photo${p.photoCount === 1 ? "" : "s"}` : ""}
                    </p>
                    {p.accessNotes && (
                      <p className="mt-1 text-xs text-stone-500">Access: {p.accessNotes}</p>
                    )}
                    <AdminPropertyPhotos
                      token={token}
                      customerId={customerId}
                      propertyId={p.id}
                    />
                    <AdminPropertyEditor
                      property={p}
                      saving={savingPropertyId === p.id}
                      onSave={async (body) => {
                        setSavingPropertyId(p.id);
                        try {
                          const updated = await api.adminUpdateCustomerProperty(
                            token,
                            customerId,
                            p.id,
                            body
                          );
                          setDetail((current) =>
                            current
                              ? {
                                  ...current,
                                  properties: current.properties.map((prop) =>
                                    prop.id === p.id ? updated : prop
                                  ),
                                }
                              : current
                          );
                          onUpdated?.();
                        } finally {
                          setSavingPropertyId(null);
                        }
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gardens-dark">Recent visits</h4>
            {detail.recentVisits.length === 0 ? (
              <p className="mt-2 text-sm text-stone-500">No visits yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {detail.recentVisits.map((v) => (
                  <li
                    key={v.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{formatDate(v.scheduledDate)}</p>
                      <p className="text-stone-600">{v.postcode}</p>
                      <p className="text-xs text-stone-500">{v.availabilityWindow}</p>
                      {v.assignedProviderName && (
                        <p className="text-xs text-stone-500">
                          Gardener: {v.assignedProviderName}
                        </p>
                      )}
                    </div>
                    <StatusBadge status={v.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <AdminCustomerPrivacyActions
            token={token}
            customerId={customerId}
            customerEmail={detail.email}
            onDeleted={onClose}
          />

          <div>
            <h4 className="text-sm font-semibold text-gardens-dark">Support conversations</h4>
            {threadsError && <p className="mt-2 text-sm text-red-600">{threadsError}</p>}
            {threadsLoading ? (
              <p className="mt-2 text-sm text-stone-500">Loading chat history…</p>
            ) : (
              <CommunicationThreadList
                threads={threads}
                loadThread={(id) => api.adminCommunicationThread(token, id)}
                emptyMessage="No support chats linked to this customer yet."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
