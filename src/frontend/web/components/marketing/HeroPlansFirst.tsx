import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  GARDEN_SIZE_GUIDE,
  GARDEN_SIZE_ORDER,
  GARDEN_SIZE_MONTHLY_PRICE_GBP,
} from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";
import { VISIT_CADENCE_HEADLINE } from "@/lib/marketing-copy";
import { Button } from "@/components/marketing/ui";

export function HeroPlansFirst() {
  return (
    <section className="border-b border-stone-200 bg-gardens-light/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gardens-primary/15 bg-white px-4 py-1.5 text-sm font-medium text-gardens-dark shadow-sm">
            <MapPin className="h-4 w-4 shrink-0 text-gardens-primary" />
            Yorkshire · Leeds, York, Wakefield
          </p>
          <p className="mt-5 text-sm font-semibold text-gardens-primary">Simple pricing · one subscription</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-gardens-dark sm:text-4xl md:text-5xl text-balance">
            Garden care priced by size.
          </h1>
          <p className="mt-4 text-base text-stone-600 text-balance sm:text-lg">
            {VISIT_CADENCE_HEADLINE} included. Pick your garden size, add optional extras, and sign up in minutes.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-10 sm:grid-cols-3">
          {GARDEN_SIZE_ORDER.map((size) => {
            const guide = GARDEN_SIZE_GUIDE[size];
            const monthly = GARDEN_SIZE_MONTHLY_PRICE_GBP[size];
            return (
              <Link
                key={size}
                href="/signup"
                className="relative flex flex-col rounded-2xl border border-stone-200 bg-white p-5 text-left shadow-soft transition hover:border-gardens-primary/30 hover:shadow-md"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
                  {guide.shortName}
                </p>
                <p className="mt-1 text-sm text-stone-600">{guide.label} maintained</p>
                <p className="mt-3 text-sm font-medium text-stone-700">{VISIT_CADENCE_HEADLINE}</p>
                <p className="mt-4 font-display text-2xl font-bold text-gardens-dark">
                  From £{formatGbp(monthly)}/mo
                </p>
                <p className="mt-1 text-xs text-stone-500">Billed monthly</p>
                <span className="mt-4 text-sm font-semibold text-gardens-primary">Get your quote →</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button href="/signup" className="w-full sm:w-auto">
            Get your quote
          </Button>
          <Button href="/#how-it-works" variant="secondary" className="w-full sm:w-auto">
            How it works
          </Button>
        </div>
      </div>
    </section>
  );
}
