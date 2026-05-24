"use client";

import { useEffect, useState } from "react";
import { api, type ProviderEarningsSummary } from "@/lib/api";
import { formatMoneyGbp } from "@/lib/provider-availability";
import { StatusBadge } from "@/components/ui";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB");
}

export function ProviderEarningsSection({
  token,
  refreshKey = 0,
}: {
  token: string;
  refreshKey?: number;
}) {
  const [summary, setSummary] = useState<ProviderEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .providerEarnings(token)
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load earnings"))
      .finally(() => setLoading(false));
  }, [token, refreshKey]);

  if (loading) {
    return <p className="text-sm text-stone-500">Loading earnings…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (!summary) return null;

  return (
    <div className="rounded-lg border bg-white p-4 text-sm shadow-sm">
      <div>
        <p className="font-medium text-gardens-dark">Your earnings</p>
        <p className="mt-1 text-stone-600">
          Accrued when you complete a visit. Paid manually by operations until automated payouts launch.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
          <p className="text-xs text-amber-800">Pending payout</p>
          <p className="text-lg font-semibold text-amber-950">
            {formatMoneyGbp(summary.accruedTotalGbp)}
          </p>
        </div>
        <div className="rounded-lg border border-green-100 bg-green-50 px-3 py-2">
          <p className="text-xs text-green-800">Paid to date</p>
          <p className="text-lg font-semibold text-green-950">
            {formatMoneyGbp(summary.paidTotalGbp)}
          </p>
        </div>
      </div>

      {summary.earnings.length === 0 ? (
        <p className="mt-4 text-stone-500">No completed visits yet — earnings appear here after you finish jobs.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {summary.earnings.map((earning) => (
            <li
              key={earning.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2"
            >
              <div>
                <p className="font-medium">
                  {formatDate(earning.visitDate)} · {earning.postcode}
                </p>
                <p className="text-stone-600">{formatMoneyGbp(earning.amountGbp)}</p>
                {earning.paidAtUtc && (
                  <p className="text-xs text-stone-500">Paid {formatDate(earning.paidAtUtc)}</p>
                )}
              </div>
              <StatusBadge status={earning.status} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
