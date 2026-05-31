"use client";

import { useEffect, useState } from "react";
import { api, type LandlordAccount } from "@/lib/api";
import { useAuth } from "@/lib/use-auth";
import { formatGbp } from "@/lib/format";

function formatVisitDate(value: string | null) {
  if (!value) return "Scheduling";
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function LandlordPortalPage() {
  const { auth, ready } = useAuth();
  const [account, setAccount] = useState<LandlordAccount | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token || auth.role !== "Landlord") return;
    api
      .landlordAccount(auth.token)
      .then(setAccount)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load account"));
  }, [auth]);

  if (!ready) return <p className="text-stone-500">Loading…</p>;
  if (!auth) {
    return (
      <p>
        Please <a href="/login" className="underline">log in</a> as a landlord.
      </p>
    );
  }
  if (auth.role !== "Landlord") {
    return (
      <p>
        You are logged in as <strong>{auth.role}</strong>.{" "}
        <a href="/login" className="underline">Switch account</a>
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">For landlords</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-gardens-dark md:text-3xl">
          Multi-property dashboard
        </h1>
        <p className="mt-2 text-stone-600">
          Demo view of your property portfolio — indicative pricing and visit schedule.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {account && (
        <>
          <div className="rounded-2xl border border-gardens-primary/20 bg-gardens-light/30 p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-gardens-dark">{account.contactName}</p>
                {account.companyName && (
                  <p className="text-sm text-stone-600">{account.companyName}</p>
                )}
                <p className="mt-1 text-sm text-stone-500">{account.email}</p>
              </div>
              {account.indicativeMonthlyGbp != null && (
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-stone-500">Indicative monthly</p>
                  <p className="font-display text-2xl font-bold text-gardens-dark">
                    {formatGbp(account.indicativeMonthlyGbp)}
                  </p>
                </div>
              )}
            </div>
            {account.agreementNotes && (
              <p className="mt-3 text-xs text-stone-500">{account.agreementNotes}</p>
            )}
          </div>

          <section>
            <h2 className="font-semibold text-gardens-dark">
              Properties ({account.properties.length})
            </h2>
            {account.properties.length === 0 ? (
              <p className="mt-3 text-sm text-stone-500">No properties on this account yet.</p>
            ) : (
            <ul className="mt-3 space-y-3">
              {account.properties.map((property) => (
                <li
                  key={property.id}
                  className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-gardens-dark">
                        {property.line1}
                        {property.line2 ? `, ${property.line2}` : ""}
                      </p>
                      <p className="text-sm text-stone-600">
                        {property.city}, {property.postcode}
                      </p>
                      <p className="mt-2 text-sm text-stone-500">
                        {property.gardenSize} garden · {property.visitFrequency} · {property.serviceLevel}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-xs uppercase tracking-wide text-stone-400">Next visit</p>
                      <p className="font-medium text-stone-700">
                        {formatVisitDate(property.nextVisitDate)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            )}
          </section>

          <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-500">
            Demo account only. Full landlord features, including instant quotes, bulk import, and invoicing, arrive in later releases.
          </p>
        </>
      )}

      {!account && !error && <p className="text-stone-500">Loading your portfolio…</p>}
    </div>
  );
}
