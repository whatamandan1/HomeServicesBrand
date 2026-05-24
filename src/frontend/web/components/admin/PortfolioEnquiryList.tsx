"use client";

import { useEffect, useState } from "react";
import { api, type PortfolioEnquiryDetail, type PortfolioEnquiryStatus, type PortfolioEnquirySummary } from "@/lib/api";

const STATUS_LABELS: Record<PortfolioEnquiryStatus, string> = {
  New: "New",
  Quoted: "Quoted",
  UnderReview: "Under review",
  Accepted: "Accepted",
  Active: "Active",
  Closed: "Closed",
};

const STATUS_OPTIONS: PortfolioEnquiryStatus[] = [
  "New",
  "Quoted",
  "UnderReview",
  "Accepted",
  "Active",
  "Closed",
];

function statusBadgeClass(status: PortfolioEnquiryStatus) {
  if (status === "New") return "bg-amber-100 text-amber-800";
  if (status === "Active" || status === "Accepted") return "bg-green-100 text-green-800";
  if (status === "Closed") return "bg-stone-100 text-stone-600";
  return "bg-sky-100 text-sky-800";
}

export function PortfolioEnquiryList({
  token,
  enquiries,
  onRefresh,
  onError,
}: {
  token: string;
  enquiries: PortfolioEnquirySummary[];
  onRefresh: () => void;
  onError?: (message: string | null) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<PortfolioEnquiryDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [busyStatus, setBusyStatus] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    onError?.(null);
    api
      .adminPortfolioEnquiry(token, selectedId)
      .then(setDetail)
      .catch((e) => onError?.(e instanceof Error ? e.message : "Could not load enquiry"))
      .finally(() => setLoadingDetail(false));
  }, [selectedId, token, onError]);

  async function updateStatus(status: PortfolioEnquiryStatus) {
    if (!selectedId) return;
    setBusyStatus(true);
    onError?.(null);
    try {
      const updated = await api.adminUpdatePortfolioEnquiryStatus(token, selectedId, status);
      setDetail(updated);
      onRefresh();
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not update status");
    } finally {
      setBusyStatus(false);
    }
  }

  if (enquiries.length === 0) {
    return <p className="text-sm text-stone-500">No multi-property enquiries yet.</p>;
  }

  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {enquiries.map((enquiry) => (
          <li key={enquiry.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-gardens-dark">{enquiry.contactName}</p>
                <p className="text-sm text-stone-600">{enquiry.email} · {enquiry.phone}</p>
                {enquiry.companyName && (
                  <p className="text-sm text-stone-500">{enquiry.companyName}</p>
                )}
                <p className="mt-1 text-xs text-stone-500">
                  {enquiry.propertyCount} properties · {new Date(enquiry.createdAtUtc).toLocaleDateString("en-GB")}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(enquiry.status)}`}>
                  {STATUS_LABELS[enquiry.status]}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedId(selectedId === enquiry.id ? null : enquiry.id)}
                  className="text-sm font-medium text-gardens-primary hover:underline"
                >
                  {selectedId === enquiry.id ? "Hide" : "View"}
                </button>
              </div>
            </div>

            {selectedId === enquiry.id && (
              <div className="mt-4 border-t border-stone-100 pt-4 text-sm">
                {loadingDetail && <p className="text-stone-500">Loading…</p>}
                {detail && detail.id === enquiry.id && (
                  <div className="space-y-4">
                    {detail.notes && (
                      <p className="text-stone-600">
                        <span className="font-medium text-stone-700">Notes:</span> {detail.notes}
                      </p>
                    )}
                    <div>
                      <p className="font-medium text-stone-700">Properties</p>
                      <ul className="mt-2 space-y-2">
                        {detail.properties.map((p) => (
                          <li key={p.id} className="rounded-md bg-stone-50 px-3 py-2 text-stone-600">
                            {p.line1}
                            {p.line2 ? `, ${p.line2}` : ""}, {p.city}, {p.postcode} — {p.gardenSize} garden
                          </li>
                        ))}
                      </ul>
                    </div>
                    <label className="block font-medium text-stone-700">
                      Status
                      <select
                        value={detail.status}
                        disabled={busyStatus}
                        onChange={(e) => updateStatus(e.target.value as PortfolioEnquiryStatus)}
                        className="field-input mt-1 max-w-xs"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
