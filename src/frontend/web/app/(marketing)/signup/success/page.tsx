"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { trackMarketingEvent } from "@/components/marketing/MarketingAnalytics";
import { loadAuth } from "@/lib/auth-storage";
import { LoadingSpinner, PageLoading } from "@/components/ui/feedback";

function SignupSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const trackedPurchase = useRef(false);

  useEffect(() => {
    if (!sessionId || trackedPurchase.current) return;
    trackedPurchase.current = true;
    trackMarketingEvent("purchase", { event_category: "signup" });
  }, [sessionId]);

  useEffect(() => {
    const auth = loadAuth();
    if (!auth?.token || auth.role !== "Customer") return;

    if (!sessionId) {
      router.replace("/portal");
      return;
    }

    let cancelled = false;
    api
      .customerSyncCheckout(auth.token, sessionId)
      .catch(() => {
        // Webhook may have already synced; still send the customer to their account.
      })
      .finally(() => {
        if (!cancelled) router.replace("/portal");
      });

    return () => {
      cancelled = true;
    };
  }, [router, sessionId]);

  return (
    <div className="flex min-h-[50vh] items-center py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-soft">
          <p className="text-4xl" aria-hidden>
            ✓
          </p>
          <h1 className="mt-4 font-display text-2xl font-bold text-gardens-dark">Welcome to GardensSorted</h1>
          <p className="mt-3 text-stone-600">Payment received - setting up your account…</p>
          <LoadingSpinner label="Almost there…" className="mt-6 justify-center" />
          <Link href="/portal" className="mt-6 inline-block text-sm text-gardens-primary underline">
            Go to your account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={<PageLoading label="Confirming your subscription…" />}>
      <SignupSuccessContent />
    </Suspense>
  );
}
