import Image from "next/image";
import { Button } from "@/components/marketing/ui";
import { HeroLocationBadge } from "@/components/marketing/HeroLocationBadge";
import { HeroVisitPreviewCard } from "@/components/marketing/HeroVisitPreviewCard";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

const HERO_GARDEN_ALT = "Well-maintained Yorkshire garden with green lawn and tidy borders";

/** Portrait photo with preview card overlapping the bottom-right corner (desktop). */
function HeroVisualStack() {
  return (
    <div className="relative isolate mx-auto w-[min(100%,22rem)] sm:w-[23rem] lg:w-[24rem]">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-gardens-primary/20 shadow-soft">
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
      <div className="mt-4 md:hidden">
        <HeroVisitPreviewCard compact />
      </div>
      <div className="relative z-10 hidden justify-end pr-1 md:-mt-[4.75rem] md:flex">
        <div className="w-[min(16.5rem,88%)] translate-x-2">
          <HeroVisitPreviewCard compact />
        </div>
      </div>
    </div>
  );
}

export function HeroProductPreview() {
  return (
    <section className="relative overflow-x-hidden border-b border-gardens-primary/15 bg-gradient-to-br from-gardens-light via-gardens-accent/25 to-stone-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-gardens-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-gardens-accent/40 blur-3xl" />
      </div>

      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:gap-7 sm:py-12 md:w-fit md:grid md:grid-cols-[auto_auto] md:items-center md:gap-x-4 md:py-14 lg:gap-x-5 lg:py-16">
        <div className="order-1 max-w-xl md:col-start-1 md:row-start-1">
          <HeroLocationBadge />
          <h1 className="mt-5 font-display text-3xl font-bold leading-tight text-gardens-dark sm:mt-6 sm:text-4xl md:text-5xl text-balance">
            Regular garden maintenance across Yorkshire
          </h1>
          <p className="mt-4 max-w-lg text-base text-gardens-dark/80 text-balance sm:mt-5 sm:text-lg">
            Regular garden maintenance for Leeds, York, Wakefield and across Yorkshire. Vetted local gardeners; you
            manage everything in your online account.
          </p>
        </div>

        <div className="order-3 md:order-none md:col-start-2 md:row-start-1 md:row-span-2 md:self-center">
          <HeroVisualStack />
        </div>

        <div className="relative z-20 order-2 max-w-xl md:order-none md:col-start-1 md:row-start-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
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
        </div>
      </div>
    </section>
  );
}
