import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/marketing/ui";

export const metadata: Metadata = {
  title: "Quote request received",
  description: "Thanks for your multi-property enquiry with GardensSorted.",
};

export default function MultiPropertyThankYouPage() {
  return (
    <section className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-bold text-gardens-dark">Thanks - we&apos;ve got it</h1>
      <p className="mt-4 text-stone-600">
        Your enquiry has been received. We&apos;ll review your properties and be in touch with a personalised indicative quote.
      </p>
      <p className="mt-2 text-sm text-stone-500">
        Check your email for a confirmation. If you don&apos;t see it, check spam or contact us.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button href="/">Back to home</Button>
        <Link href="/multi-property-solutions" className="text-sm font-medium text-gardens-primary hover:underline">
          For landlords
        </Link>
      </div>
    </section>
  );
}
