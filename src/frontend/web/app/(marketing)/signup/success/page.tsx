import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "You're all set",
  description: "Your GardensSorted subscription is being activated. View your account to see upcoming visits.",
};

export default function SignupSuccessPage() {
  return (
    <div className="flex min-h-[50vh] items-center py-20">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="rounded-2xl border border-stone-200 bg-white p-10 shadow-soft">
          <p className="text-4xl" aria-hidden>
            ✓
          </p>
          <h1 className="mt-4 font-display text-2xl font-bold text-gardens-dark">Welcome to GardensSorted</h1>
          <p className="mt-3 text-stone-600">
            Your payment was successful. We&apos;re setting up your subscription and scheduling your first visits.
          </p>
          <ul className="mt-6 space-y-2 text-left text-sm text-stone-600">
            <li>· View upcoming visits in your account</li>
            <li>· Update your address or access notes anytime</li>
            <li>· Reschedule visits before your gardener arrives</li>
          </ul>
          <Link
            href="/portal"
            className="mt-8 inline-block rounded-full bg-gardens-primary px-8 py-3 text-sm font-semibold text-white hover:bg-gardens-dark"
          >
            Go to your account
          </Link>
        </div>
      </div>
    </div>
  );
}
