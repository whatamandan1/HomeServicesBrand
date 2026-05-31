"use client";

import { useEffect, useState } from "react";
import { api, type ProviderVettingDetails, type ProviderVettingStatus, type SubmitProviderVettingPayload } from "@/lib/api";
import { ID_DOCUMENT_TYPES } from "@/lib/provider-vetting";
import {
  PROVIDER_ADDON_EQUIPMENT,
  PROVIDER_ADDON_EQUIPMENT_SUMMARY,
  PROVIDER_VETTING_SUMMARY,
} from "@/lib/provider-requirements";
import { LoadingSpinner } from "@/components/ui/feedback";

type Props = {
  token: string;
  isApproved: boolean;
  status: ProviderVettingStatus;
  onSubmitted: (details: ProviderVettingDetails) => void;
  onError: (message: string) => void;
};

export function ProviderVettingSection({ token, isApproved, status, onSubmitted, onError }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rtwMode, setRtwMode] = useState<"shareCode" | "document">("shareCode");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idDocumentType, setIdDocumentType] = useState("Passport");
  const [idDocumentNumber, setIdDocumentNumber] = useState("");
  const [rightToWorkShareCode, setRightToWorkShareCode] = useState("");
  const [rightToWorkDocumentDescription, setRightToWorkDocumentDescription] = useState("");
  const [dbsCertificateNumber, setDbsCertificateNumber] = useState("");
  const [dbsIssueDate, setDbsIssueDate] = useState("");
  const [dbsOnUpdateService, setDbsOnUpdateService] = useState(false);
  const [hasLeafBlower, setHasLeafBlower] = useState(false);
  const [hasHedgeTrimmer, setHasHedgeTrimmer] = useState(false);
  const [hasPressureWasherForPatio, setHasPressureWasherForPatio] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .providerVetting(token)
      .then((d) => {
        if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
        if (d.idDocumentType) setIdDocumentType(d.idDocumentType);
        if (d.idDocumentNumber) setIdDocumentNumber(d.idDocumentNumber);
        if (d.rightToWorkShareCode) {
          setRtwMode("shareCode");
          setRightToWorkShareCode(d.rightToWorkShareCode);
        } else if (d.rightToWorkDocumentDescription) {
          setRtwMode("document");
          setRightToWorkDocumentDescription(d.rightToWorkDocumentDescription);
        }
        if (d.dbsCertificateNumber) setDbsCertificateNumber(d.dbsCertificateNumber);
        if (d.dbsIssueDate) setDbsIssueDate(d.dbsIssueDate);
        setDbsOnUpdateService(d.dbsOnUpdateService);
        setHasLeafBlower(d.hasLeafBlower);
        setHasHedgeTrimmer(d.hasHedgeTrimmer);
        setHasPressureWasherForPatio(d.hasPressureWasherForPatio);
      })
      .catch(() => {
        /* first visit — empty form */
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isApproved) return;

    setSaving(true);
    setLocalMessage(null);
    onError("");

    const payload: SubmitProviderVettingPayload = {
      dateOfBirth,
      idDocumentType,
      idDocumentNumber: idDocumentNumber.trim(),
      rightToWorkShareCode: rtwMode === "shareCode" ? rightToWorkShareCode.trim() || null : null,
      rightToWorkDocumentDescription:
        rtwMode === "document" ? rightToWorkDocumentDescription.trim() || null : null,
      dbsCertificateNumber: dbsCertificateNumber.trim(),
      dbsIssueDate,
      dbsOnUpdateService,
      hasLeafBlower,
      hasHedgeTrimmer,
      hasPressureWasherForPatio,
    };

    try {
      const details = await api.providerSubmitVetting(token, payload);
      onSubmitted(details);
      setLocalMessage("Details submitted — we'll verify your ID, right to work, and DBS before approval.");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Could not save vetting details");
    } finally {
      setSaving(false);
    }
  }

  if (isApproved) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="font-display text-lg font-semibold text-gardens-dark">Vetting</h2>
        <p className="mt-2 text-sm text-stone-600">Your checks are complete and your account is approved.</p>
        <p className="mt-3 text-sm text-stone-600">
          To change add-on equipment, contact support — we need to keep visit matching accurate.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-soft">
        <LoadingSpinner label="Loading vetting form…" />
      </div>
    );
  }

  const submitted = status.isSubmitted;

  return (
    <div className="rounded-2xl border border-gardens-primary/25 bg-white p-5 shadow-soft sm:p-6">
      <h2 className="font-display text-lg font-semibold text-gardens-dark">Checks &amp; documents</h2>
      <p className="mt-2 text-sm text-stone-600">{PROVIDER_VETTING_SUMMARY}</p>
      {submitted && (
        <p className="mt-3 rounded-lg bg-gardens-light/80 px-3 py-2 text-sm text-gardens-dark">
          Submitted — waiting for verification. You can update details below until you are approved.
        </p>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-stone-700">
          Date of birth
          <input
            type="date"
            required
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="field-input mt-1"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700">
            Photo ID type
            <select
              value={idDocumentType}
              onChange={(e) => setIdDocumentType(e.target.value)}
              className="field-input mt-1"
            >
              {ID_DOCUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700">
            ID document number
            <input
              required
              value={idDocumentNumber}
              onChange={(e) => setIdDocumentNumber(e.target.value)}
              className="field-input mt-1"
              autoComplete="off"
            />
          </label>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-700">Right to work in the UK</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="rtwMode"
                checked={rtwMode === "shareCode"}
                onChange={() => setRtwMode("shareCode")}
              />
              Gov.uk share code
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="rtwMode"
                checked={rtwMode === "document"}
                onChange={() => setRtwMode("document")}
              />
              I will show a document
            </label>
          </div>
          {rtwMode === "shareCode" ? (
            <label className="block text-sm text-stone-600">
              9-character share code from{" "}
              <a
                href="https://www.gov.uk/prove-right-to-work"
                className="text-gardens-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                prove right to work
              </a>
              <input
                required
                maxLength={9}
                value={rightToWorkShareCode}
                onChange={(e) => setRightToWorkShareCode(e.target.value.toUpperCase())}
                className="field-input mt-1 font-mono uppercase"
                placeholder="ABC12DEF3"
              />
            </label>
          ) : (
            <label className="block text-sm text-stone-600">
              Document you will present (e.g. British passport)
              <input
                required
                value={rightToWorkDocumentDescription}
                onChange={(e) => setRightToWorkDocumentDescription(e.target.value)}
                className="field-input mt-1"
              />
            </label>
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-stone-700">
            Basic DBS certificate number
            <input
              required
              value={dbsCertificateNumber}
              onChange={(e) => setDbsCertificateNumber(e.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            DBS issue date
            <input
              type="date"
              required
              value={dbsIssueDate}
              onChange={(e) => setDbsIssueDate(e.target.value)}
              className="field-input mt-1"
            />
          </label>
        </div>

        <label className="flex items-start gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={dbsOnUpdateService}
            onChange={(e) => setDbsOnUpdateService(e.target.checked)}
            className="mt-1"
          />
          Registered with the DBS Update Service
        </label>

        <fieldset className="space-y-3 border-t border-stone-100 pt-4">
          <legend className="text-sm font-medium text-stone-700">Add-on equipment you own</legend>
          <p className="text-xs text-stone-500">{PROVIDER_ADDON_EQUIPMENT_SUMMARY}</p>
          <ul className="space-y-3">
            {PROVIDER_ADDON_EQUIPMENT.map((item) => {
              const checked =
                item.field === "hasLeafBlower"
                  ? hasLeafBlower
                  : item.field === "hasHedgeTrimmer"
                    ? hasHedgeTrimmer
                    : hasPressureWasherForPatio;
              const setChecked =
                item.field === "hasLeafBlower"
                  ? setHasLeafBlower
                  : item.field === "hasHedgeTrimmer"
                    ? setHasHedgeTrimmer
                    : setHasPressureWasherForPatio;
              return (
                <li key={item.field}>
                  <label className="flex items-start gap-2 text-sm text-stone-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setChecked(e.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{item.label}</span>
                      <span className="block text-xs text-stone-500">
                        For: {item.enables}. {item.detail}
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <p className="text-xs text-stone-500">
          We store this securely for verification only. You may be asked to show original documents before approval.
        </p>

        {localMessage && (
          <p className="rounded-lg bg-gardens-light/80 px-3 py-2 text-sm text-gardens-dark">{localMessage}</p>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
          {saving ? "Saving…" : submitted ? "Update details" : "Submit for verification"}
        </button>
      </form>
    </div>
  );
}
