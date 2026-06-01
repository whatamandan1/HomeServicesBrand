import Image from "next/image";
import { Button } from "@/components/marketing/ui";
import type { AreaPageCopy } from "@/lib/seo/area-pages";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

const HERO_GARDEN_ALT = "Well-maintained Yorkshire garden with green lawn and tidy borders";

type AreaLandingHeroProps = {
  copy: AreaPageCopy;
};

export function AreaLandingHero({ copy }: AreaLandingHeroProps) {
  return (
    <section className="relative overflow-x-hidden border-b border-gardens-primary/15 bg-gradient-to-br from-gardens-light via-gardens-accent/25 to-stone-100">
      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold text-gardens-primary">{copy.hub.areaLabel}</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-gardens-dark sm:text-4xl md:text-5xl text-balance">
          {copy.h1}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gardens-dark/80 text-balance">{copy.heroLead}</p>
        <p className="mt-3 max-w-2xl text-sm text-stone-600">{copy.localParagraph}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href={PRIMARY_CTA_HREF}>{PRIMARY_CTA_LABEL}</Button>
          <Button href="#pricing" variant="secondary" className="border-gardens-primary/25 bg-white/90 hover:bg-white">
            See pricing
          </Button>
        </div>
        <div className="relative mt-10 aspect-[21/9] max-h-72 overflow-hidden rounded-2xl border border-gardens-primary/20 shadow-soft">
          <Image
            src="/hero-garden.jpg"
            alt={HERO_GARDEN_ALT}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1152px"
            priority
          />
        </div>
      </div>
    </section>
  );
}
