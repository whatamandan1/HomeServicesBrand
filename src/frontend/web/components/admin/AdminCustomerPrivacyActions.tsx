"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function AdminCustomerPrivacyActions({
  token,
  customerId,
  customerEmail,
  onDeleted,
}: {
  token: string;
  customerId: string;
  customerEmail: string;
  onDeleted?: () => void;
}) {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  async function exportData() {
    setBusy("export");
    setError(null);
    setMessage(null);
    try {
      const data = await api.adminExportCustomerData(token, customerId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `customer-export-${customerEmail.replace("@", "-at-")}-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Customer data export downloaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        `Permanently delete ${customerEmail}? Active subscriptions will be cancelled and personal data anonymised.`
      )
    ) {
      return;
    }

    setBusy("delete");
    setError(null);
    setMessage(null);
    try {
      const result = await api.adminDeleteCustomerAccount(token, customerId, confirmation);
      setMessage(result.message);
      setShowDelete(false);
      onDeleted?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4">
      <h4 className="text-sm font-semibold text-gardens-dark">Privacy (on request)</h4>
      <p className="mt-1 text-xs text-stone-500">
        GDPR export or erasure — use only when the customer has asked in writing.
      </p>

      {message && <p className="mt-2 text-sm text-green-800">{message}</p>}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={exportData}
          className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
        >
          {busy === "export" ? "Exporting…" : "Download customer data"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => setShowDelete((v) => !v)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete customer account
        </button>
      </div>

      {showDelete && (
        <div className="mt-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
          <p className="text-sm text-stone-700">
            Type the customer email <strong>{customerEmail}</strong> to confirm.
          </p>
          <input
            type="email"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="field-input mt-2 max-w-md"
            autoComplete="off"
          />
          <button
            type="button"
            disabled={
              busy !== null
              || confirmation.trim().toLowerCase() !== customerEmail.toLowerCase()
            }
            onClick={deleteAccount}
            className="mt-2 rounded-lg bg-red-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {busy === "delete" ? "Deleting…" : "Confirm deletion"}
          </button>
        </div>
      )}
    </div>
  );
}
