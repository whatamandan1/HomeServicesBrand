"use client";

import { useEffect, useState } from "react";
import { api, type CustomerPayment, type CustomerSubscription } from "@/lib/api";
import { StatusBadge } from "@/components/ui";

type BillingSectionProps = {
  token: string;
  subscriptions: CustomerSubscription[];
  onContactSupport: (message: string) => void;
  onError: (message: string | null) => void;
};

function formatGbp(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function openBillingPortal(subscriptionId: string) {
  window.location.href = `/portal/billing-redirect?subscriptionId=${encodeURIComponent(subscriptionId)}`;
}

export function BillingSection({
  token,
  subscriptions,
  onContactSupport,
  onError,
}: BillingSectionProps) {
  const [payments, setPayments] = useState<CustomerPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    setLoadingPayments(true);
    api
      .customerPayments(token)
      .then(setPayments)
      .catch((e) =>
        onError(e instanceof Error ? e.message : "Could not load payment history")
      )
      .finally(() => setLoadingPayments(false));
  }, [token]);

  const cancellableSubs = subscriptions.filter(
    (s) => s.status === "Active" || s.status === "PastDue"
  );

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-semibold text-gardens-dark">Subscriptions</h2>
        <p className="mt-1 text-sm text-stone-500">
          Update your payment method or download invoices. To cancel, contact customer service —
          we&apos;ll honour your minimum term.
        </p>
        {subscriptions.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No subscriptions yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {subscriptions.map((s) => (
              <li key={s.id} className="rounded-xl border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.planName}</span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  Availability: {s.availabilityPreference}
                </p>
                {s.startedAtUtc && (
                  <p className="text-xs text-stone-400">
                    Since {formatDate(s.startedAtUtc)}
                  </p>
                )}
                {s.minimumTermEndsAtUtc && (
                  <p className="mt-1 text-xs text-stone-500">
                    Minimum term until {formatDate(s.minimumTermEndsAtUtc)}
                  </p>
                )}
                {s.cancelsAtUtc && (
                  <p className="mt-1 text-xs text-amber-700">
                    Cancels on {formatDate(s.cancelsAtUtc)}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.canManageBilling && (
                    <button
                      type="button"
                      className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                      onClick={() => openBillingPortal(s.id)}
                    >
                      Payment method &amp; invoices
                    </button>
                  )}
                  {(s.status === "Active" || s.status === "PastDue") && !s.cancelsAtUtc && (
                    <button
                      type="button"
                      className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                      onClick={() =>
                        onContactSupport(
                          `I'd like to cancel my ${s.planName} subscription. Please can you help?`
                        )
                      }
                    >
                      Request cancellation
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cancellableSubs.length > 0 && (
        <p className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
          Subscriptions can only be cancelled by our team. Use{" "}
          <strong>Request cancellation</strong> above to message support — if you&apos;re within
          your minimum term, billing continues until that date.
        </p>
      )}

      <section>
        <h2 className="font-semibold text-gardens-dark">Payment history</h2>
        <p className="mt-1 text-sm text-stone-500">
          Successful charges on your account. For PDF receipts, open{" "}
          <strong>Payment method &amp; invoices</strong> above.
        </p>
        {loadingPayments ? (
          <p className="mt-3 text-sm text-stone-500">Loading payments…</p>
        ) : payments.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">No payments recorded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-soft">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-100 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                      {formatDate(p.paidAtUtc)}
                    </td>
                    <td className="px-4 py-3 text-stone-700">{p.planName}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-stone-700">
                      {formatGbp(p.amountGbp)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
