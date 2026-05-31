"use client";

import { useEffect, useState } from "react";
import {
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentChoice,
  type StoredCookieConsent,
} from "@/lib/cookie-consent";

const LABELS: Record<CookieConsentChoice, string> = {
  all: "Accept all (analytics and marketing)",
  essential: "Essential only",
};

export function CookiePreferences() {
  const [current, setCurrent] = useState<StoredCookieConsent | null>(null);

  useEffect(() => {
    setCurrent(readCookieConsent());
  }, []);

  function choose(choice: CookieConsentChoice) {
    setCurrent(writeCookieConsent(choice));
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4">
      <p className="text-sm font-medium text-stone-800">Your current choice</p>
      <p className="mt-1 text-sm text-stone-600">
        {current ? LABELS[current.choice] : "No choice saved yet — use the banner when it appears, or pick below."}
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" className="btn-primary min-h-[44px] sm:flex-1" onClick={() => choose("all")}>
          Accept all
        </button>
        <button
          type="button"
          className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 sm:flex-1"
          onClick={() => choose("essential")}
        >
          Essential only
        </button>
      </div>
      <p className="mt-3 text-xs text-stone-500">
        Changing to essential only stops new marketing/analytics scripts on future page loads. You may still need to
        clear existing third-party cookies in your browser.
      </p>
    </div>
  );
}
