"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/providers", label: "For gardeners" },
  { href: "/multi-property-solutions", label: "For landlords" },
];

function isLegacyPricingHash() {
  return typeof window !== "undefined" && window.location.hash.toLowerCase() === "#pricing";
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    closeMenu();
  }, [pathname, closeMenu]);

  useEffect(() => {
    const onHashChange = () => {
      closeMenu();
      if (isLegacyPricingHash()) {
        router.replace("/signup");
      }
    };

    window.addEventListener("hashchange", onHashChange);
    if (isLegacyPricingHash()) {
      onHashChange();
    }
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [closeMenu, router]);

  useBodyScrollLock(open);

  const onHome = pathname === "/";
  const onSignup = pathname === "/signup";
  const showHeaderCta = !onSignup;

  const handleNavClick = useCallback(
    (href: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      closeMenu();
      if (href.startsWith("/#") && pathname === "/") {
        e.preventDefault();
        const id = href.slice(2);
        window.history.pushState(null, "", href);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    },
    [closeMenu, pathname]
  );

  const mobileMenu = open ? (
      <div
        className="fixed inset-0 z-[100] flex flex-col bg-white md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
      >
        <div
          className={`flex items-center justify-between gap-2 border-b px-4 py-3 ${
            onHome ? "border-gardens-primary/15 bg-gardens-light/85" : "border-gardens-primary/10 bg-white/95"
          }`}
        >
          <Logo variant="icon" className="shrink-0" href="/" />
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stone-200 text-stone-700"
            aria-label="Close menu"
            onClick={closeMenu}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 [-webkit-overflow-scrolling:touch]"
          aria-label="Mobile"
          style={{ touchAction: "pan-y" }}
        >
          <ul className="space-y-1">
            {!onSignup && (
              <li className="pb-2">
                <Link
                  href={PRIMARY_CTA_HREF}
                  className="flex min-h-[48px] items-center justify-center rounded-full bg-gardens-primary px-4 text-base font-semibold text-white shadow-soft hover:bg-gardens-dark"
                  onClick={closeMenu}
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
                  onClick={handleNavClick(l.href)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                className="flex min-h-[48px] items-center rounded-xl px-3 text-base font-medium text-stone-700 hover:bg-gardens-light/50"
                onClick={closeMenu}
              >
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    ) : null;

  return (
    <>
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
                className="inline-flex min-h-[44px] shrink-0 items-center rounded-full bg-gardens-primary px-3 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-gardens-dark sm:px-5"
              >
                <span className="md:hidden">Get quote</span>
                <span className="hidden md:inline">{PRIMARY_CTA_LABEL}</span>
              </Link>
            )}
            <button
              type="button"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {mobileMenu ? createPortal(mobileMenu, document.body) : null}
    </>
  );
}
