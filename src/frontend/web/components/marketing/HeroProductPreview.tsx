import Image from "next/image";
import Link from "next/link";
import { CalendarCheck, MapPin, UserRound } from "lucide-react";
import { Button } from "@/components/marketing/ui";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

const HERO_GARDEN_ALT = "Well-maintained Yorkshire garden with green lawn and tidy borders";

function VisitPreviewCard() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gardens-primary/20 bg-white shadow-lg ring-1 ring-gardens-primary/5">
      <div className="flex items-start justify-between gap-3 border-b border-gardens-primary/10 bg-gardens-dark px-5 py-3">
        <div>
          <p className="text-sm font-semibold text-white">GardensSorted</p>
          <p className="text-xs text-gardens-accent/90">Your visits</p>
        </div>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gardens-accent">
          Preview
        </span>
      </div>
      <div className="bg-gradient-to-b from-gardens-light/40 to-white p-5 sm:p-6">
        <p className="text-sm font-medium text-stone-500">Your next visit</p>
        <p className="mt-3 font-display text-xl font-semibold text-gardens-dark">Thu 12 Jun · LS8 4AP</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-stone-700">
          <CalendarCheck className="h-4 w-4 shrink-0 text-gardens-primary" />
          Morning window · 9am–12pm
        </p>
        <span className="mt-4 inline-flex rounded-full bg-gardens-primary/15 px-2.5 py-0.5 text-xs font-semibold text-gardens-dark">
          Confirmed
        </span>
        <p className="mt-4 flex items-center gap-2 text-sm text-stone-700">
          <UserRound className="h-4 w-4 shrink-0 text-gardens-primary" />
          Gardener: Alex R.
        </p>
        <div className="mt-5 hidden gap-3 border-t border-gardens-primary/10 pt-4 text-sm text-stone-500 sm:flex">
          <span>Reschedule</span>
          <span aria-hidden>·</span>
          <span>View account</span>
        </div>
        <p className="mt-4 text-xs text-stone-500">Example from a customer account — yours will look like this.</p>
      </div>
    </div>
  );
}

function HeroVisualStack() {
  return (
    <div className="relative mx-auto w-full max-w-lg pb-6 md:max-w-none md:pb-10">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gardens-primary/20 shadow-soft sm:aspect-[5/4] md:aspect-[4/5] md:max-h-[480px]">
        <Image
          src="/hero-garden.jpg"
          alt={HERO_GARDEN_ALT}
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 100vw, 540px"
          priority
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gardens-dark/35 via-gardens-dark/5 to-transparent"
          aria-hidden
        />
      </div>

      <div className="relative z-10 -mt-20 px-3 sm:-mt-24 sm:px-4 md:absolute md:inset-x-0 md:bottom-0 md:mt-0 md:px-6 md:pb-0">
        <div className="md:ml-auto md:max-w-[min(100%,22rem)] md:translate-y-6">
          <VisitPreviewCard />
        </div>
      </div>
    </div>
  );
}

export function HeroProductPreview() {
  return (
    <section className="relative overflow-x-hidden border-b border-gardens-primary/15 bg-gradient-to-br from-gardens-light via-gardens-accent/25 to-stone-100">
      <div
        className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-gardens-primary/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-gardens-accent/40 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:py-14 md:grid-cols-2 md:items-center md:gap-12 md:py-16 md:pb-20 lg:py-20 lg:pb-24">
        <div>
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
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
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
              From £25/mo on annual billing
            </Link>
            {" · Essential, Premium & Elite plans"}
          </p>
        </div>

        <HeroVisualStack />
      </div>
    </section>
  );
}
