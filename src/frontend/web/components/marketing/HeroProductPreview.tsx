import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/marketing/ui";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

const HERO_GARDEN_ALT = "Well-maintained Yorkshire garden with green lawn and tidy borders";

function VisitPreviewCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gardens-primary/20 bg-white shadow-lg ring-1 ring-gardens-primary/5">
      <div
        className={`flex items-start justify-between gap-3 border-b border-gardens-primary/10 bg-gardens-dark ${
          compact ? "px-4 py-2.5" : "px-5 py-3"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-white">GardensSorted</p>
          <p className="text-xs text-gardens-accent/90">Your visits</p>
        </div>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gardens-accent">
          Preview
        </span>
      </div>
      <div className={`bg-gradient-to-b from-gardens-light/40 to-white ${compact ? "p-4" : "p-5 sm:p-6"}`}>
        <p className="text-sm font-medium text-stone-500">Your next visit</p>
        <p
          className={`mt-2 font-display font-semibold text-gardens-dark ${
            compact ? "text-lg" : "mt-3 text-xl"
          }`}
        >
          Thu 12 Jun · LS8 4AP
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-stone-700">
          <CalendarCheck className="h-4 w-4 shrink-0 text-gardens-primary" />
          Morning window · 9am–12pm
        </p>
        <span className="mt-3 inline-flex rounded-full bg-gardens-primary/15 px-2.5 py-0.5 text-xs font-semibold text-gardens-dark">
          Confirmed
        </span>
        <p className="mt-3 flex items-center gap-2 text-sm text-stone-700">
          <UserRound className="h-4 w-4 shrink-0 text-gardens-primary" />
          Gardener: Alex R.
        </p>
        {!compact && (
          <>
            <div className="mt-5 hidden gap-3 border-t border-gardens-primary/10 pt-4 text-sm text-stone-500 sm:flex">
              <span>Reschedule</span>
              <span aria-hidden>·</span>
              <span>View account</span>
            </div>
            <p className="mt-4 text-xs text-stone-500">Example from a customer account — yours will look like this.</p>
          </>
        )}
      </div>
    </div>
  );
}

/** Portrait photo with preview card overlapping the bottom-right corner. */
function HeroVisualStack() {
  return (
    <div className="relative mx-auto w-[min(100%,22rem)] pb-6 sm:w-[23rem] sm:pb-8 lg:w-[24rem]">
      <div className="relative aspect-[4/5] w-full overflow-visible">
        <div className="absolute inset-0 overflow-hidden rounded-2xl border border-gardens-primary/20 shadow-soft">
          <Image
            src="/hero-garden.jpg"
            alt={HERO_GARDEN_ALT}
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 352px, 384px"
            priority
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gardens-dark/50 via-gardens-dark/10 to-transparent"
            aria-hidden
          />
        </div>

        <div className="absolute bottom-0 right-0 z-10 w-[min(16.5rem,88%)] translate-x-2 translate-y-[35%]">
          <VisitPreviewCard compact />
        </div>
      </div>
    </div>
  );
}

export function HeroProductPreview() {
  return (
    <section className="relative border-b border-gardens-primary/15 bg-gradient-to-br from-gardens-light via-gardens-accent/25 to-stone-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-gardens-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-gardens-accent/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:gap-7 sm:py-12 md:w-fit md:grid md:grid-cols-[auto_auto] md:items-center md:gap-x-4 md:py-14 lg:gap-x-5 lg:py-16">
        <div className="max-w-xl md:col-start-1 md:row-start-1">
          <p className="inline-flex items-center gap-2 rounded-full border border-gardens-primary/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-gardens-dark shadow-sm backdrop-blur-sm">
            <MapPin className="h-4 w-4 shrink-0 text-gardens-primary" />
            Yorkshire · Leeds, York, Wakefield
          </p>
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-gardens-dark sm:mt-6 sm:text-4xl md:text-5xl text-balance">
            Regular visits.
            <br />
            One subscription.
          </h1>
          <p className="mt-4 max-w-lg text-base text-gardens-dark/80 text-balance sm:mt-5 sm:text-lg">
            We schedule visits, assign an approved local gardener, and keep you updated — you manage everything
            in your online account.
          </p>
        </div>

        <div className="md:col-start-2 md:row-start-1 md:row-span-2 md:self-center">
          <HeroVisualStack />
        </div>

        <div className="max-w-xl md:col-start-1 md:row-start-2">
          <div className="mt-2 flex flex-col gap-3 sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-4">
            <Button href={PRIMARY_CTA_HREF} className="w-full sm:w-auto">
              {PRIMARY_CTA_LABEL}
            </Button>
            <Button
              href="/#how-it-works"
              variant="secondary"
              className="w-full border-gardens-primary/25 bg-white/90 sm:w-auto hover:bg-white"
            >
              How it works
            </Button>
          </div>
          <p className="mt-6 text-sm text-gardens-dark/70">
            <Link href="/#pricing" className="font-medium text-gardens-primary hover:underline">
              From £59.99/mo — Essential, small garden
            </Link>
            {" · Essential, Premium & Elite plans"}
          </p>
        </div>
      </div>
    </section>
  );
}
