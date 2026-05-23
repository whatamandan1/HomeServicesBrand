"use client";

import { useState } from "react";
import { ActAsUserButton } from "@/components/admin/ActAsUserButton";
import { api, type AdminProvider, type AuthResponse } from "@/lib/api";

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
    </div>
  );
}
