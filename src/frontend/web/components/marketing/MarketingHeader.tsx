import Link from "next/link";
import { Leaf } from "lucide-react";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/providers", label: "For gardeners" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gardens-primary/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-gardens-dark">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gardens-primary text-white">
            <Leaf className="h-5 w-5" />
          </span>
          GardensSorted
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-stone-600 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-gardens-primary">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-medium text-stone-600 hover:text-gardens-primary sm:inline">
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-gardens-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition hover:bg-gardens-dark"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
