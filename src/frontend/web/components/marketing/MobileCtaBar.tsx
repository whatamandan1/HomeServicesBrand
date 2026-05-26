"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

export function MobileCtaBar() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <Link
        href={PRIMARY_CTA_HREF}
        className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-gardens-primary text-base font-semibold text-white shadow-soft"
      >
        {PRIMARY_CTA_LABEL}
      </Link>
    </div>
  );
}
