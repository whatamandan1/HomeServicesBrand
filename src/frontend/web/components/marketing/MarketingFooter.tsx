import Image from "next/image";
import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="border-t border-gardens-primary/10 bg-gardens-dark text-gardens-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-block">
            <Image src="/logo-white.svg" alt="GardensSorted" width={200} height={40} />
          </Link>
          <p className="mt-4 max-w-sm text-sm text-gardens-accent/90">
            Recurring garden care for Yorkshire homes. Part of the Sorted platform — subscription home services, done properly.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-gardens-accent/80">
            <li><a href="/#how-it-works" className="hover:text-white">How it works</a></li>
            <li><a href="/#pricing" className="hover:text-white">Pricing</a></li>
            <li><a href="/signup" className="hover:text-white">Sign up</a></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-gardens-accent/80">
            <li><a href="/providers" className="hover:text-white">Become a gardener</a></li>
            <li><a href="/login" className="hover:text-white">Log in</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-gardens-accent/60">
        © {new Date().getFullYear()} GardensSorted · Powered by Sorted
      </div>
    </footer>
  );
}
