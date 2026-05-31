"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { allowsMarketingCookies, readCookieConsent } from "@/lib/cookie-consent";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

function useMarketingConsent(): boolean {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    function sync() {
      setAllowed(allowsMarketingCookies(readCookieConsent()));
    }
    sync();
    window.addEventListener("sorted-cookie-consent", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("sorted-cookie-consent", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return allowed;
}

/** Loads Meta Pixel and GA4 only after the user accepts non-essential cookies. */
export function MarketingAnalytics() {
  const allowed = useMarketingConsent();
  if (!allowed) return null;

  return (
    <>
      {META_PIXEL_ID ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
      {GA_MEASUREMENT_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-config" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}

/** Call after checkout success or other conversion events (no-op without consent or IDs). */
export function trackMarketingEvent(
  eventName: string,
  params?: Record<string, string | number>
) {
  if (!allowsMarketingCookies(readCookieConsent())) return;
  if (typeof window === "undefined") return;
  const w = window as Window & {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  };
  if (META_PIXEL_ID && w.fbq) {
    w.fbq("track", eventName, params);
  }
  if (GA_MEASUREMENT_ID && w.gtag) {
    w.gtag("event", eventName, params);
  }
}
