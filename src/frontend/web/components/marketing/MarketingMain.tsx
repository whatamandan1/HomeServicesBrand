"use client";

import { usePathname } from "next/navigation";
import { MOBILE_HOME_MAIN_PADDING_CLASS } from "@/lib/mobile-chrome";

/** Homepage fixed bottom CTA bar - padding only where that bar is shown. */
function needsMobileCtaPadding(pathname: string) {
  return pathname === "/";
}

export function MarketingMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const padForMobileBar = needsMobileCtaPadding(pathname);
  const isSignup = pathname === "/signup";

  return (
    <main
      className={
        isSignup
          ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-stone-50/80"
          : padForMobileBar
            ? `bg-stone-50/80 ${MOBILE_HOME_MAIN_PADDING_CLASS} md:pb-0`
            : "bg-stone-50/80"
      }
    >
      {children}
    </main>
  );
}
