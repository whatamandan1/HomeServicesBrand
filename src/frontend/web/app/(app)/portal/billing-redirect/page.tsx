"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { loadAuth } from "@/lib/auth-storage";

function BillingRedirectContent() {
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subscriptionId) {
      setError("Missing subscription.");
      return;
    }

    const auth = loadAuth();
    if (!auth?.token || auth.role !== "Customer") {
      setError("Please sign in as a customer.");
      return;
    }

    let cancelled = false;
    api
      .customerBillingPortal(auth.token, subscriptionId)
      .then(({ url }) => {
        if (!cancelled) window.location.replace(url);
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not open billing portal");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [subscriptionId]);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-red-600">{error}</p>
        <Link href="/portal" className="mt-4 inline-block text-gardens-primary underline">
          Back to portal
        </Link>
      </div>
    );
  }

  return <p className="py-12 text-center text-stone-500">Opening billing portal…</p>;
}

export default function BillingRedirectPage() {
  return (
    <Suspense fallback={<p className="py-12 text-center text-stone-500">Loading…</p>}>
      <BillingRedirectContent />
    </Suspense>
  );
}
