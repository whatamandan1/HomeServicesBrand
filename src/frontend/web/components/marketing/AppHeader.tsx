"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import type { AuthResponse } from "@/lib/api";
import { loadAuth, syncSessionCookies } from "@/lib/auth-storage";
import { useBodyScrollLock } from "@/lib/use-body-scroll-lock";

const customerLink = { href: "/portal", label: "Customer portal" } as const;
const providerLink = { href: "/provider", label: "Provider jobs" } as const;
const adminLink = { href: "/admin", label: "Admin CRM" } as const;
const landlordLink = { href: "/landlord", label: "Landlord portal" } as const;
const switchAccountLink = { href: "/login", label: "Switch account" } as const;

function navLinksForRole(role: AuthResponse["role"] | null) {
  if (role === "Admin") {
    return [adminLink, switchAccountLink];
  }
  if (role === "Provider") {
    return [providerLink, switchAccountLink];
  }
  if (role === "Landlord") {
    return [landlordLink, switchAccountLink];
  }
  if (role === "Customer") {
    return [customerLink, switchAccountLink];
  }
  return [{ href: "/login", label: "Log in" }];
}

export function AppHeader() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<AuthResponse["role"] | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useBodyScrollLock(open);

  useEffect(() => {
    const auth = loadAuth();
    if (auth) syncSessionCookies(auth);
    setRole(auth?.role ?? null);
  }, [pathname]);

  const links = useMemo(() => navLinksForRole(role), [role]);

  return (
    <header className="sticky top-0 z-50 border-b border-gardens-primary/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex" aria-label="App">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-gardens-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-stone-200 text-stone-700 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-stone-100 bg-white px-4 py-4 md:hidden" aria-label="Mobile app">
          <ul className="space-y-1">
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
          </ul>
        </nav>
      )}
    </header>
  );
}
