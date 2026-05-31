"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readCookieConsent, writeCookieConsent } from "@/lib/cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readCookieConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-stone-200 bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] sm:p-5 md:bottom-4 md:inset-x-auto md:left-4 md:right-4 md:max-w-xl md:rounded-2xl md:border"
    >
      <p id="cookie-consent-title" className="text-sm font-semibold text-gardens-dark">
        Cookies on this site
      </p>
      <p id="cookie-consent-desc" className="mt-2 text-sm text-stone-600">
        We use essential cookies to keep you signed in. With your permission we also use analytics and marketing
        cookies (such as Meta and Google) to measure ads and improve our service. See our{" "}
        <Link href="/cookies" className="font-medium text-gardens-primary hover:underline">
          cookie policy
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-medium text-gardens-primary hover:underline">
          privacy policy
        </Link>
        .
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          className="btn-primary min-h-[44px] flex-1 sm:flex-none"
          onClick={() => {
            writeCookieConsent("all");
            setVisible(false);
          }}
        >
          Accept all
        </button>
        <button
          type="button"
          className="min-h-[44px] flex-1 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 sm:flex-none"
          onClick={() => {
            writeCookieConsent("essential");
            setVisible(false);
          }}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
