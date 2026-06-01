import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AreaLandingHero } from "@/components/marketing/AreaLandingHero";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingTrustBar } from "@/components/marketing/MarketingTrustBar";
import { Button, Section } from "@/components/marketing/ui";
import {
  AREA_CITY_SLUGS,
  areaFaqs,
  getAreaPageCopy,
  isAreaCitySlug,
  type AreaCitySlug,
} from "@/lib/seo/area-pages";
import { faqPageJsonLd, localServiceJsonLd } from "@/lib/seo/json-ld";
import { canonicalPath } from "@/lib/seo/site";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

type PageProps = { params: Promise<{ city: string }> };

export function generateStaticParams() {
  return AREA_CITY_SLUGS.map((city) => ({ city }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city } = await params;
  if (!isAreaCitySlug(city)) return {};
  const copy = getAreaPageCopy(city);
  const path = `/areas/${city}`;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: canonicalPath(path) },
    openGraph: {
      title: `${copy.metaTitle} | GardensSorted`,
      description: copy.metaDescription,
      url: canonicalPath(path),
    },
    keywords: copy.keywords,
  };
}

export default async function AreaCityPage({ params }: PageProps) {
  const { city } = await params;
  if (!isAreaCitySlug(city)) notFound();
  const copy = getAreaPageCopy(city as AreaCitySlug);
  const faqs = areaFaqs(copy);

  return (
    <>
      <JsonLd data={[localServiceJsonLd(copy), faqPageJsonLd(faqs)]} />
      <AreaLandingHero copy={copy} />
      <MarketingTrustBar />
      <Section
        title="Why GardensSorted"
        subtitle={`Reliable garden maintenance for ${copy.hub.label} homeowners - without chasing quotes every season.`}
        className="bg-stone-50/80"
      >
        <ul className="mx-auto max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-stone-700">
          <li>10 scheduled visits per year - lawn, borders, and tidy each time</li>
          <li>Vetted local gardeners - manage visits in your online account</li>
          <li>Personalised quote by garden size before you subscribe</li>
          <li>Secure online checkout and support when you need us</li>
        </ul>
        <div className="mt-8 flex justify-center">
          <Button href={PRIMARY_CTA_HREF}>{PRIMARY_CTA_LABEL}</Button>
        </div>
      </Section>
      <Section
        id="faq"
        title={`Garden care in ${copy.hub.label} - FAQs`}
        className="border-t border-gardens-primary/10"
      >
        <FaqAccordion items={faqs} />
        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-stone-600">
          Also serving{" "}
          {AREA_CITY_SLUGS.filter((s) => s !== city).map((slug, i, arr) => (
            <span key={slug}>
              <Link href={`/areas/${slug}`} className="font-medium text-gardens-primary hover:underline">
                {getAreaPageCopy(slug).hub.label}
              </Link>
              {i < arr.length - 1 ? " and " : ""}
            </span>
          ))}
          . <Link href="/" className="font-medium text-gardens-primary hover:underline">Yorkshire overview</Link>
        </p>
      </Section>
      <section className="bg-gardens-dark py-16 text-center text-white">
        <div className="mx-auto max-w-xl px-4">
          <h2 className="font-display text-2xl font-bold md:text-3xl">
            Get your garden care quote in {copy.hub.label}
          </h2>
          <p className="mt-3 text-gardens-accent">Enter your postcode - we confirm availability before you pay.</p>
          <div className="mt-6">
            <Button href={PRIMARY_CTA_HREF} className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
              {PRIMARY_CTA_LABEL}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
