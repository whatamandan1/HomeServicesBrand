import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarCheck,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { HeroProductPreview } from "@/components/marketing/HeroProductPreview";
import { JsonLd } from "@/components/marketing/JsonLd";
import { MarketingTrustBar } from "@/components/marketing/MarketingTrustBar";
import { ServicePillarsSection } from "@/components/marketing/ServicePillarsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";
import { VISIT_CADENCE_HEADLINE, VISIT_CADENCE_INCLUDED } from "@/lib/marketing-copy";
import { HOME_FAQS } from "@/lib/seo/home-faqs";
import {
  customerTestimonialsJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  serviceCatalogJsonLd,
  webSiteJsonLd,
} from "@/lib/seo/json-ld";
import { CUSTOMER_TESTIMONIALS } from "@/lib/seo/testimonials";
import { canonicalPath } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Garden maintenance Leeds & Yorkshire",
  description:
    `Regular garden maintenance with ${VISIT_CADENCE_HEADLINE.toLowerCase()}. Vetted local gardeners in Leeds, York, Wakefield and across Yorkshire. Get your personalised quote online.`,
  alternates: { canonical: canonicalPath("/") },
  openGraph: {
    title: "Garden maintenance Leeds & Yorkshire | GardensSorted",
    description:
      "Recurring garden care - lawn, borders, and tidy on a schedule. Subscribe online, manage visits in your account.",
    url: canonicalPath("/"),
  },
};

const steps = [
  {
    icon: Sparkles,
    title: "Pick your garden size",
    body: "Pick your garden size and any add-ons. Sign up in a few minutes with your address and when you're usually home.",
  },
  {
    icon: CalendarCheck,
    title: "We book your visits",
    body: "Recurring visits are scheduled in your preferred window - weekday mornings, afternoons, or weekends.",
  },
  {
    icon: Users,
    title: "Your gardener arrives",
    body: "Vetted local gardeners take on your visits. View upcoming dates and details anytime in your online account.",
  },
];

const included = [
  VISIT_CADENCE_INCLUDED,
  "Personalised quote by garden size (up to 150 m² maintained)",
  "Optional add-ons: hedges, seasonal tidy, patio refresh",
  "Online account to view and manage every visit",
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={[
          organizationJsonLd(),
          webSiteJsonLd(),
          serviceCatalogJsonLd(),
          faqPageJsonLd(HOME_FAQS),
          customerTestimonialsJsonLd(CUSTOMER_TESTIMONIALS),
        ]}
      />
      <HeroProductPreview />

      <MarketingTrustBar />

      <Section
        id="how-it-works"
        title="How it works"
        subtitle="Regular garden maintenance made simple - no chasing quotes or hunting for someone reliable each time."
        className="bg-stone-50/80"
      >
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="relative rounded-2xl border border-stone-200 bg-white p-8 shadow-soft">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gardens-light text-gardens-primary">
                <step.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gardens-primary">Step {i + 1}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-gardens-dark">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{step.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <SocialProofSection />

      <section className="border-y border-gardens-primary/15 bg-gardens-light/50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold text-gardens-primary">What you get</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-gardens-dark md:text-4xl text-balance">
                Everything you need for a garden that stays sorted
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                Whether you&apos;re short on time or just want someone dependable, GardensSorted keeps your outdoor space maintained on a schedule that suits you.
              </p>
            </div>
            <ul className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
              {included.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-stone-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gardens-primary" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ServicePillarsSection />

      <Section
        id="faq"
        title="Common questions"
        subtitle="Still unsure? Chat with us - we're happy to help before you sign up."
        className="border-t border-gardens-primary/10 bg-white"
      >
        <FaqAccordion items={HOME_FAQS} />
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-stone-600">
          Local pages:{" "}
          <Link href="/areas/leeds" className="font-medium text-gardens-primary hover:underline">
            Garden maintenance Leeds
          </Link>
          ,{" "}
          <Link href="/areas/york" className="font-medium text-gardens-primary hover:underline">
            York
          </Link>
          ,{" "}
          <Link href="/areas/wakefield" className="font-medium text-gardens-primary hover:underline">
            Wakefield
          </Link>
          .
        </p>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-stone-600">
          Have a question we haven&apos;t answered?{" "}
          <Link href="/#chat" className="font-medium text-gardens-primary hover:underline">
            Start a chat
          </Link>{" "}
          or{" "}
          <Link href={PRIMARY_CTA_HREF} className="font-medium text-gardens-primary hover:underline">
            {PRIMARY_CTA_LABEL.toLowerCase()}
          </Link>
          .
        </p>
      </Section>

      <section className="bg-gardens-dark py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready for a garden you&apos;re proud of?</h2>
          <p className="mt-4 text-gardens-accent">Join Yorkshire homeowners who want reliable care without the hassle.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href={PRIMARY_CTA_HREF} className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
              {PRIMARY_CTA_LABEL}
            </Button>
            <Link
              href="/#chat"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Ask a question
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
