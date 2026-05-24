"use client";

import { useEffect, useState } from "react";
import { AdminProviderAvailabilitySection } from "@/components/admin/AdminProviderAvailabilitySection";
import { ActAsUserButton } from "@/components/admin/ActAsUserButton";
import { api, type AdminProvider, type AuthResponse, type ProviderEarningsSummary } from "@/lib/api";
import { formatMoneyGbp } from "@/lib/provider-availability";
import { StatusBadge } from "@/components/ui";

export function ProviderDetailPanel({
  provider,
  token,
  adminAuth,
  onClose,
  onUpdated,
  onError,
}: {
  provider: AdminProvider;
  token: string;
  adminAuth: AuthResponse;
  onClose: () => void;
  onUpdated: (updated: AdminProvider) => void;
  onError?: (message: string) => void;
}) {
  const [postcode, setPostcode] = useState(provider.coveragePostcode ?? "");
  const [radius, setRadius] = useState(provider.coverageRadiusMiles || 10);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [earnings, setEarnings] = useState<ProviderEarningsSummary | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);

  useEffect(() => {
    setEarningsLoading(true);
    api
      .adminProviderEarnings(token, provider.id)
      .then(setEarnings)
      .catch(() => setEarnings(null))
      .finally(() => setEarningsLoading(false));
  }, [provider.id, token]);

  async function markPaid(earningId: string) {
    setMarkingPaidId(earningId);
    setError(null);
    try {
      await api.adminMarkProviderEarningPaid(token, provider.id, earningId);
      const refreshed = await api.adminProviderEarnings(token, provider.id);
      setEarnings(refreshed);
      setMessage("Earning marked paid.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark paid");
    } finally {
      setMarkingPaidId(null);
    }
  }

  async function saveCoverage() {
    const trimmed = postcode.trim();
    if (!trimmed) {
      setError("Enter a base postcode.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const updated = await api.adminUpdateProviderCoverage(
        token,
        provider.id,
        trimmed,
        radius
      );
      setPostcode(updated.coveragePostcode ?? trimmed);
      setRadius(updated.coverageRadiusMiles);
      onUpdated(updated);
      setMessage(
        "Coverage saved. Postcode areas refresh in the background — reload this panel in a minute if the list looks stale."
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function approve() {
    setError(null);
    try {
      await api.approveProvider(token, provider.id);
      onUpdated({ ...provider, isApproved: true });
      setMessage("Provider approved — they can now claim jobs.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Approval failed");
    }
  }

  const outcodes = provider.coveredOutcodes ?? [];

  return (
    <div className="rounded-xl border border-gardens-primary/20 bg-gardens-light/10 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="font-semibold text-gardens-dark">Provider detail</h3>
        <div className="flex flex-wrap items-center gap-2">
          <ActAsUserButton
            adminAuth={adminAuth}
            userId={provider.userId}
            label="Act as provider"
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

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-green-800">{message}</p>}

      <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <span className="text-stone-500">Name</span>
          <p className="font-medium">{provider.name}</p>
        </div>
        <div>
          <span className="text-stone-500">Email</span>
          <p className="font-medium">{provider.email}</p>
        </div>
        <div>
          <span className="text-stone-500">Status</span>
          <p className="font-medium">
            {provider.isApproved ? (
              <span className="text-green-700">Approved</span>
            ) : (
              <span className="text-amber-700">Pending approval</span>
            )}
          </p>
        </div>
      </div>

      {!provider.isApproved && (
        <button
          type="button"
          onClick={approve}
          className="mt-4 rounded-lg bg-gardens-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Approve provider
        </button>
      )}

      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-semibold text-gardens-dark">Coverage area</h4>
        <label className="block text-sm font-medium text-stone-700">
          Base postcode
          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="LS1 4AP"
            className="field-input mt-1"
          />
        </label>
        <label className="block text-sm font-medium text-stone-700">
          Radius: {radius} miles
          <input
            type="range"
            min={1}
            max={50}
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="mt-2 w-full accent-gardens-primary"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={saveCoverage}
          className="rounded-lg border border-gardens-primary px-4 py-2 text-sm font-semibold text-gardens-primary hover:bg-gardens-light/30 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save coverage"}
        </button>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-semibold text-gardens-dark">Postcode areas</h4>
        {outcodes.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">
            No areas synced yet — they appear after signup or after you save coverage.
          </p>
        ) : (
          <p className="mt-2 text-xs text-stone-600">
            {outcodes.slice(0, 36).join(", ")}
            {outcodes.length > 36 ? ` +${outcodes.length - 36} more` : ""}
          </p>
        )}
      </div>

      <div className="mt-6">
        <AdminProviderAvailabilitySection
          token={token}
          providerId={provider.id}
          onNotice={setMessage}
          onError={setError}
        />
      </div>

      <div className="mt-6 space-y-3">
        <h4 className="text-sm font-semibold text-gardens-dark">Earnings</h4>
        {earningsLoading ? (
          <p className="text-sm text-stone-500">Loading earnings…</p>
        ) : earnings ? (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-sm">
                <p className="text-xs text-amber-800">Pending</p>
                <p className="font-semibold text-amber-950">
                  {formatMoneyGbp(earnings.accruedTotalGbp)}
                </p>
              </div>
              <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-sm">
                <p className="text-xs text-green-800">Paid</p>
                <p className="font-semibold text-green-950">
                  {formatMoneyGbp(earnings.paidTotalGbp)}
                </p>
              </div>
            </div>
            {earnings.earnings.length === 0 ? (
              <p className="text-sm text-stone-500">No completed visits yet.</p>
            ) : (
              <ul className="space-y-2">
                {earnings.earnings.slice(0, 10).map((earning) => (
                  <li
                    key={earning.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(earning.visitDate).toLocaleDateString("en-GB")} · {earning.postcode}
                      </p>
                      <p className="text-stone-600">{formatMoneyGbp(earning.amountGbp)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={earning.status} />
                      {earning.status === "Accrued" && (
                        <button
                          type="button"
                          disabled={markingPaidId === earning.id}
                          onClick={() => markPaid(earning.id)}
                          className="rounded-lg border border-stone-200 px-2 py-1 text-xs font-medium hover:bg-stone-50 disabled:opacity-50"
                        >
                          {markingPaidId === earning.id ? "Saving…" : "Mark paid"}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-stone-500">Could not load earnings.</p>
        )}
      </div>
    </div>
  );
}
