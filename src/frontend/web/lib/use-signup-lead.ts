import { useCallback, useEffect, useRef } from "react";
import { api, type GardenSize } from "@/lib/api";
import { getSignupSessionId } from "@/lib/signup-lead-session";
import { isValidEmail } from "@/lib/signup-utils";

export type SignupLeadSnapshot = {
  firstName: string;
  lastName: string;
  email: string;
  lastStep: number;
  selectedPlanName?: string;
  gardenSize?: GardenSize;
  postcode?: string;
};

function canCapture(snapshot: SignupLeadSnapshot): boolean {
  return (
    snapshot.firstName.trim().length > 0 &&
    snapshot.lastName.trim().length > 0 &&
    isValidEmail(snapshot.email)
  );
}

function buildPayload(snapshot: SignupLeadSnapshot) {
  return {
    email: snapshot.email.trim(),
    phone: "",
    firstName: snapshot.firstName.trim(),
    lastName: snapshot.lastName.trim() || null,
    marketingOptIn: false,
    lastStep: snapshot.lastStep,
    selectedPlanName: snapshot.selectedPlanName ?? null,
    gardenSize: snapshot.gardenSize ?? null,
    postcode: snapshot.postcode?.trim() || null,
    sessionId: getSignupSessionId(),
  };
}

export function useSignupLeadCapture(snapshot: SignupLeadSnapshot, enabled = true) {
  const lastSent = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const capture = useCallback(async (force = false) => {
    if (!enabled || !canCapture(snapshot)) return;
    const payload = buildPayload(snapshot);
    const key = JSON.stringify(payload);
    if (!force && key === lastSent.current) return;
    lastSent.current = key;
    try {
      await api.captureSignupLead(payload);
    } catch {
      // Lead capture must not block signup.
    }
  }, [enabled, snapshot]);

  useEffect(() => {
    if (!enabled || !canCapture(snapshot)) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void capture();
    }, 900);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [capture, enabled, snapshot]);

  useEffect(() => {
    if (!enabled) return;

    function onPageHide() {
      if (!canCapture(snapshot)) return;
      const payload = buildPayload(snapshot);
      const body = JSON.stringify(payload);
      const sent = navigator.sendBeacon?.("/api/marketing/signup-leads", new Blob([body], { type: "application/json" }));
      if (!sent) {
        void fetch("/api/marketing/signup-leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    }

    window.addEventListener("pagehide", onPageHide);
    return () => window.removeEventListener("pagehide", onPageHide);
  }, [enabled, snapshot]);

  return { captureLead: () => capture(true) };
}
