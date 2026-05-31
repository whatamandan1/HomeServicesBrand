"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/about", label: "About us" },
  { href: "/providers", label: "For gardeners" },
  { href: "/multi-property-solutions", label: "For landlords" },
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useBodyScrollLock(open);

  const onHome = pathname === "/";
  const onSignup = pathname === "/signup";
  const showHeaderCta = !onSignup;

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-md ${
        onHome
          ? "border-gardens-primary/15 bg-gardens-light/85"
          : "border-gardens-primary/10 bg-white/95"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 md:gap-3 md:py-4">
        <Logo variant="icon" className="shrink-0 md:hidden" href="/" />
        <Logo className="hidden shrink-0 md:inline-flex" href="/" />

        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-gardens-primary">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden min-h-[44px] items-center text-sm font-medium text-stone-600 hover:text-gardens-primary sm:inline-flex"
          >
            Log in
          </Link>
          {showHeaderCta && (
            <Link
              href={PRIMARY_CTA_HREF}
              className="relative z-10 inline-flex min-h-[44px] shrink-0 items-center rounded-full bg-gardens-primary px-3 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-gardens-dark sm:px-5"
            >
              <span className="md:hidden">Get quote</span>
              <span className="hidden md:inline">{PRIMARY_CTA_LABEL}</span>
            </Link>
          )}
          <button
            type="button"
            className="relative z-10 inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-stone-100 bg-white px-4 py-4 md:hidden"
          aria-label="Mobile"
        >
          <ul className="space-y-1">
            {!onSignup && (
              <li className="pb-2">
                <Link
                  href={PRIMARY_CTA_HREF}
                  className="flex min-h-[48px] items-center justify-center rounded-full bg-gardens-primary px-4 text-base font-semibold text-white shadow-soft hover:bg-gardens-dark"
                  onClick={() => setOpen(false)}
                >
                  {PRIMARY_CTA_LABEL}
                </Link>
              </li>
            )}
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex min-h-[48px] items-center rounded-xl px-3 text-base font-medium text-stone-700 hover:bg-gardens-light/50"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="flex min-h-[48px] items-center rounded-xl px-3 text-base font-medium text-stone-700 hover:bg-gardens-light/50"
                onClick={() => setOpen(false)}
              >
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
