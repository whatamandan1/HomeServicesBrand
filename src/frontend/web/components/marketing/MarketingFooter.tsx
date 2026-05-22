import Link from "next/link";
import { Leaf } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gardens-primary/10 bg-gardens-dark text-gardens-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 font-display text-lg font-semibold text-white">
            <Leaf className="h-5 w-5" />
            GardensSorted
          </div>
          <p className="mt-3 max-w-sm text-sm text-gardens-accent/90">
            Recurring garden care for Yorkshire homes. Part of the Sorted platform — subscription home services, done properly.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-gardens-accent/80">
            <li><Link href="/#how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/#pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link href="/signup" className="hover:text-white">Sign up</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-gardens-accent/80">
            <li><Link href="/providers" className="hover:text-white">Become a gardener</Link></li>
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-gardens-accent/60">
        © {new Date().getFullYear()} GardensSorted · Powered by Sorted
      </div>
    </footer>
  );
}
