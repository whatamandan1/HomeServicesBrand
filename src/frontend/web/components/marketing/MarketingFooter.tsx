import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gardens-primary/10 bg-gardens-dark text-gardens-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block">
            <Image src="/logo-white.svg" alt="GardensSorted" width={272} height={48} className="h-10 w-auto" />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-gardens-accent/90">
            Recurring garden care for Yorkshire homes - subscribe online, we handle the rest.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-gardens-accent/80">
            <li><Link href="/#how-it-works" className="inline-flex min-h-[44px] items-center hover:text-white">How it works</Link></li>
            <li><Link href="/#pricing" className="inline-flex min-h-[44px] items-center hover:text-white">Pricing</Link></li>
            <li><Link href="/signup" className="inline-flex min-h-[44px] items-center hover:text-white">Sign up</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-gardens-accent/80">
            <li><Link href="/providers" className="hover:text-white">Become a gardener</Link></li>
            <li><Link href="/multi-property-solutions" className="hover:text-white">For landlords</Link></li>
            <li><Link href="/login" className="hover:text-white">Log in</Link></li>
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of service</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-gardens-accent/60">
        © {new Date().getFullYear()} GardensSorted · Yorkshire garden care subscriptions
      </div>
    </footer>
  );
}
