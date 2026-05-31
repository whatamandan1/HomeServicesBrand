"use client";

import { usePathname } from "next/navigation";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

/** Full site footer hidden on mobile during signup to avoid extra scroll past the wizard. */
export function MarketingFooterSignupAware() {
  const pathname = usePathname();
  if (pathname === "/signup") {
    return (
      <div className="hidden md:block">
        <MarketingFooter />
      </div>
    );
  }
  return <MarketingFooter />;
}
