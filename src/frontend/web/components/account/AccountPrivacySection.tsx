"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { clearAuth } from "@/lib/auth-storage";
import { AlertBanner } from "@/components/ui/feedback";

export function AccountPrivacySection({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [showDelete, setShowDelete] = useState(false);

  async function exportData() {
    setBusy("export");
    setError(null);
    setMessage(null);
    try {
      const data = await api.privacyExport(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `gardenssorted-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setMessage("Your data export has downloaded.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    if (
      !window.confirm(
        "This permanently deletes your account and anonymises your personal data. Active subscriptions will be cancelled. Continue?"
      )
    ) {
      return;
    }

    setBusy("delete");
    setError(null);
    setMessage(null);
    try {
      await api.privacyDeleteAccount(token, confirmation);
      clearAuth();
      window.location.href = "/?account-deleted=1";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deletion failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section>
      <h2 className="font-semibold text-gardens-dark">Privacy &amp; data</h2>
      <p className="mt-1 text-sm text-stone-500">
        Download a copy of your account data or request deletion under UK GDPR.
      </p>

      {message && (
        <AlertBanner variant="success" message={message} onDismiss={() => setMessage(null)} className="mt-3" />
      )}
      {error && (
        <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} className="mt-3" />
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy !== null}
          onClick={exportData}
          className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 disabled:opacity-50"
        >
          {busy === "export" ? "Preparing export…" : "Download my data"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => setShowDelete((v) => !v)}
          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Delete my account
        </button>
      </div>

      {showDelete && (
        <div className="mt-4 rounded-xl border border-red-100 bg-red-50/50 p-4">
          <p className="text-sm text-stone-700">
            Type your email <strong>{email}</strong> to confirm deletion.
          </p>
          <input
            type="email"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="field-input mt-3 max-w-md"
            autoComplete="off"
          />
          <button
            type="button"
            disabled={busy !== null || confirmation.trim().toLowerCase() !== email.toLowerCase()}
            onClick={deleteAccount}
            className="mt-3 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50"
          >
            {busy === "delete" ? "Deleting…" : "Permanently delete account"}
          </button>
        </div>
      )}
    </section>
  );
}
