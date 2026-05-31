"use client";

import { useEffect, useState } from "react";
import { api, type AdminProviderVetting } from "@/lib/api";
import { ID_DOCUMENT_TYPES } from "@/lib/provider-vetting";
import { PROVIDER_ADDON_EQUIPMENT } from "@/lib/provider-requirements";
import { LoadingSpinner } from "@/components/ui/feedback";

function idTypeLabel(value: string | null) {
  if (!value) return "-";
  return ID_DOCUMENT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function AdminProviderVettingSection({
  token,
  providerId,
  isApproved,
  onVettingUpdated,
}: {
  token: string;
  providerId: string;
  isApproved: boolean;
  onVettingUpdated: () => void;
}) {
  const [vetting, setVetting] = useState<AdminProviderVetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .adminProviderVetting(token, providerId)
      .then(setVetting)
      .catch(() => setVetting(null))
      .finally(() => setLoading(false));
  }, [token, providerId]);

  async function setVerified(
    field: "idVerified" | "rightToWorkVerified" | "dbsVerified" | "insuranceVerified",
    value: boolean
  ) {
    setSaving(true);
    setError(null);
    try {
      const updated = await api.adminUpdateProviderVettingVerification(token, providerId, {
        [field]: value,
      });
      setVetting(updated);
      onVettingUpdated();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingSpinner label="Loading vetting…" />;

  if (!vetting?.status.isSubmitted) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Provider has not submitted vetting details yet - they must complete the form in their portal after signup.
      </p>
    );
  }

  const s = vetting.status;

  return (
    <div className="space-y-4 rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm">
      <h4 className="font-semibold text-gardens-dark">Submitted vetting details</h4>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div>
          <dt className="text-stone-500">Date of birth</dt>
          <dd className="font-medium">{vetting.dateOfBirth ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-stone-500">Photo ID</dt>
          <dd className="font-medium">
            {idTypeLabel(vetting.idDocumentType)} - {vetting.idDocumentNumber ?? "-"}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-stone-500">Right to work</dt>
          <dd className="font-medium">
            {vetting.rightToWorkShareCode
              ? `Share code: ${vetting.rightToWorkShareCode}`
              : vetting.rightToWorkDocumentDescription ?? "-"}
          </dd>
        </div>
        <div>
          <dt className="text-stone-500">DBS certificate</dt>
          <dd className="font-medium">{vetting.dbsCertificateNumber ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-stone-500">DBS issue date</dt>
          <dd className="font-medium">
            {vetting.dbsIssueDate ?? "-"}
            {vetting.dbsOnUpdateService ? " · Update Service" : ""}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-stone-500">Insurance</dt>
          <dd className="font-medium">
            {vetting.hasOwnRelevantInsurance
              ? "Declared - own relevant cover for gardening work"
              : "Not declared"}
          </dd>
        </div>
      </dl>

      <div className="border-t border-stone-200 pt-3">
        <p className="text-xs font-medium text-stone-600">Add-on equipment declared</p>
        <ul className="mt-2 space-y-1">
          {PROVIDER_ADDON_EQUIPMENT.map((item) => {
            const has =
              item.field === "hasLeafBlower"
                ? vetting.hasLeafBlower
                : item.field === "hasHedgeTrimmer"
                  ? vetting.hasHedgeTrimmer
                  : vetting.hasPressureWasherForPatio;
            return (
              <li key={item.field} className="flex justify-between gap-2">
                <span className="text-stone-700">{item.label}</span>
                <span className={has ? "font-medium text-gardens-primary" : "text-stone-400"}>
                  {has ? "Yes" : "No"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-stone-500">
          Only assign hedge, seasonal, or patio add-on visits when the matching tool is Yes.
        </p>
      </div>

      {!isApproved && (
        <div className="space-y-2 border-t border-stone-200 pt-3">
          <p className="text-xs font-medium text-stone-600">Mark verified (required before approve):</p>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.idVerified}
              disabled={saving}
              onChange={(e) => setVerified("idVerified", e.target.checked)}
            />
            ID verified
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.rightToWorkVerified}
              disabled={saving}
              onChange={(e) => setVerified("rightToWorkVerified", e.target.checked)}
            />
            Right to work verified
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.dbsVerified}
              disabled={saving}
              onChange={(e) => setVerified("dbsVerified", e.target.checked)}
            />
            DBS verified
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={s.insuranceVerified}
              disabled={saving || !vetting.hasOwnRelevantInsurance}
              onChange={(e) => setVerified("insuranceVerified", e.target.checked)}
            />
            Insurance verified
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
