"use client";

import { useEffect, useState } from "react";
import { api, type ProviderVettingDetails, type ProviderVettingStatus, type SubmitProviderVettingPayload } from "@/lib/api";
import { ID_DOCUMENT_TYPES } from "@/lib/provider-vetting";
import {
  PROVIDER_ADDON_EQUIPMENT,
  PROVIDER_ADDON_EQUIPMENT_SUMMARY,
  PROVIDER_INSURANCE_DECLARATION,
  PROVIDER_DBS_APPLY_URL,
  PROVIDER_DBS_SUMMARY,
  PROVIDER_DBS_UPDATE_SERVICE_URL,
  PROVIDER_RTW_SUMMARY,
  PROVIDER_VETTING_SUMMARY,
} from "@/lib/provider-requirements";
import { LoadingSpinner } from "@/components/ui/feedback";
import { ProviderIdPhotoUpload } from "@/components/provider/ProviderIdPhotoUpload";

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
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [idDocumentType, setIdDocumentType] = useState("Passport");
  const [idDocumentNumber, setIdDocumentNumber] = useState("");
  const [rightToWorkDocumentDescription, setRightToWorkDocumentDescription] = useState("");
  const [dbsCertificateNumber, setDbsCertificateNumber] = useState("");
  const [dbsIssueDate, setDbsIssueDate] = useState("");
  const [dbsOnUpdateService, setDbsOnUpdateService] = useState(false);
  const [hasLeafBlower, setHasLeafBlower] = useState(false);
  const [hasHedgeTrimmer, setHasHedgeTrimmer] = useState(false);
  const [hasPressureWasherForPatio, setHasPressureWasherForPatio] = useState(false);
  const [hasOwnRelevantInsurance, setHasOwnRelevantInsurance] = useState(false);
  const [hasIdPhoto, setHasIdPhoto] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .providerVetting(token)
      .then((d) => {
        if (d.dateOfBirth) setDateOfBirth(d.dateOfBirth);
        if (d.idDocumentType) setIdDocumentType(d.idDocumentType);
        if (d.idDocumentNumber) setIdDocumentNumber(d.idDocumentNumber);
        if (d.rightToWorkDocumentDescription) {
          setRightToWorkDocumentDescription(d.rightToWorkDocumentDescription);
        } else if (d.rightToWorkShareCode) {
          setRightToWorkDocumentDescription(`Share code on file (${d.rightToWorkShareCode}) - please describe your right-to-work document`);
        }
        if (d.dbsCertificateNumber) setDbsCertificateNumber(d.dbsCertificateNumber);
        if (d.dbsIssueDate) setDbsIssueDate(d.dbsIssueDate);
        setDbsOnUpdateService(d.dbsOnUpdateService);
        setHasLeafBlower(d.hasLeafBlower);
        setHasHedgeTrimmer(d.hasHedgeTrimmer);
        setHasPressureWasherForPatio(d.hasPressureWasherForPatio);
        setHasOwnRelevantInsurance(d.hasOwnRelevantInsurance);
        setHasIdPhoto(d.status.hasIdPhoto);
      })
      .catch(() => {
        /* first visit - empty form */
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isApproved) return;
    if (!hasIdPhoto) {
      onError("Upload a photo of your ID before submitting.");
      return;
    }

    setSaving(true);
    setLocalMessage(null);
    onError("");

    const payload: SubmitProviderVettingPayload = {
      dateOfBirth,
      idDocumentType,
      idDocumentNumber: idDocumentNumber.trim(),
      rightToWorkShareCode: null,
      rightToWorkDocumentDescription: rightToWorkDocumentDescription.trim() || null,
      dbsCertificateNumber: dbsCertificateNumber.trim(),
      dbsIssueDate,
      dbsOnUpdateService,
      hasLeafBlower,
      hasHedgeTrimmer,
      hasPressureWasherForPatio,
      hasOwnRelevantInsurance,
    };

    try {
      const details = await api.providerSubmitVetting(token, payload);
      onSubmitted(details);
      setLocalMessage("Details submitted - we'll verify your ID, right to work, DBS, and insurance before approval.");
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
          To change add-on equipment, contact support - we need to keep visit matching accurate.
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
          Submitted - waiting for verification. You can update details below until you are approved.
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

        <ProviderIdPhotoUpload
          token={token}
          disabled={isApproved}
          onPhotoChange={setHasIdPhoto}
          loadPhoto={api.providerIdPhoto}
          uploadPhoto={api.providerUploadIdPhoto}
          deletePhoto={api.providerDeleteIdPhoto}
          fetchPhotoBlob={api.providerFetchIdPhotoBlob}
        />

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-700">Right to work in the UK (self-employed)</legend>
          <p className="text-xs text-stone-500">{PROVIDER_RTW_SUMMARY}</p>
          <label className="block text-sm text-stone-600">
            Right-to-work document
            <input
              required
              value={rightToWorkDocumentDescription}
              onChange={(e) => setRightToWorkDocumentDescription(e.target.value)}
              className="field-input mt-1"
              placeholder="e.g. British passport (same as photo ID above)"
            />
          </label>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-stone-700">Basic DBS check</legend>
          <p className="text-xs text-stone-500">
            {PROVIDER_DBS_SUMMARY}{" "}
            <a
              href={PROVIDER_DBS_APPLY_URL}
              className="text-gardens-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Apply for a basic DBS check on GOV.UK
            </a>
            .
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              Certificate number
              <input
                required
                value={dbsCertificateNumber}
                onChange={(e) => setDbsCertificateNumber(e.target.value)}
                className="field-input mt-1"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Issue date
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
            <span>
              Registered with the{" "}
              <a
                href={PROVIDER_DBS_UPDATE_SERVICE_URL}
                className="text-gardens-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                DBS Update Service
              </a>
            </span>
          </label>
        </fieldset>

        <label className="flex items-start gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-700">
          <input
            type="checkbox"
            required
            checked={hasOwnRelevantInsurance}
            onChange={(e) => setHasOwnRelevantInsurance(e.target.checked)}
            className="mt-1 shrink-0"
          />
          <span>{PROVIDER_INSURANCE_DECLARATION}</span>
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
          We store this securely for verification only. Your ID photo and details are reviewed by our team before
          approval.
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
