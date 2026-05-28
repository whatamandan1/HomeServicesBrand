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
import { PricingSection } from "@/components/marketing/PricingSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

export const metadata: Metadata = {
  title: "Garden care subscriptions in Yorkshire",
  description:
    "Regular garden maintenance for Yorkshire homes. Subscribe online, choose your plan, and we schedule trusted local gardeners — from £39.95/month.",
  openGraph: {
    title: "GardensSorted — Garden care subscriptions in Yorkshire",
    description:
      "Regular garden maintenance for Yorkshire homes. Subscribe online and we handle scheduling.",
  },
};

const steps = [
  {
    icon: Sparkles,
    title: "Choose your plan",
    body: "Pick monthly or annual care for your garden size. Sign up in a few minutes with your address and when you're usually home.",
  },
  {
    icon: CalendarCheck,
    title: "We book your visits",
    body: "Recurring visits are scheduled in your preferred window — weekday mornings, afternoons, or weekends.",
  },
  {
    icon: Users,
    title: "Your gardener arrives",
    body: "Approved local gardeners take on your visits. View upcoming dates and details anytime in your online account.",
  },
];

const included = [
  "Essential: 10 visits per year — lawn, borders, and tidy",
  "Premium: 20 visits per year plus hedges & beds",
  "Elite: 30 visits per year (~every 10 days) with patio refresh included",
  "Pricing scales across five garden sizes (up to 150 m²)",
  "Online account to view and manage every visit",
];

const faqs = [
  {
    q: "What's included in Essential?",
    a: "10 visits per year (about monthly): lawn mowing and edging, light border and bed tidy, and clippings removed. Manage visits and get support through your online account.",
  },
  {
    q: "What's included in Premium?",
    a: "20 visits per year (about every two weeks), plus everything in Essential — light hedge trim, bed weeding, and seasonal tidy work like leaves and light pruning.",
  },
  {
    q: "What's included in Elite?",
    a: "30 visits per year (about every 10 days), with everything in Premium plus one included patio & path refresh per year. Best for fast-growing gardens or owners who want consistent upkeep through the season.",
  },
  {
    q: "How does garden size affect price?",
    a: "Small gardens (up to 50 m²) are our base price — from £39.95/month Essential, or from about £33/month on annual billing. Each larger size band adds £10/month (£100/year on annual plans): Medium up to 75 m², Large up to 100 m², X Large up to 125 m², XX Large up to 150 m². Premium and Elite use the same uplifts.",
  },
  {
    q: "What's not included?",
    a: "Major clearance, tree surgery, tall hedge reduction, and landscaping. We don't make separate trips just for watering, patio cleaning, leaf blowing, or gutter clearing — but we can quote those as seasonal add-ons.",
  },
  {
    q: "Do you water the garden?",
    a: "While we're on a scheduled visit, we'll water pots, containers, and obvious dry spots if you have an outdoor tap and hose. We don't run separate watering visits between maintenance — ask us about seasonal options if you need more.",
  },
  {
    q: "Can you clean the patio, blow leaves, or clear gutters?",
    a: "Premium and Elite include light leaf blow and clear in the garden on visit days in season, and we'll lightly sweep garden-adjacent paving while we're there. Thorough patio cleaning, large leaf clearances, and gutter clearing are optional add-ons — message us for a quote.",
  },
  {
    q: "Which areas do you cover?",
    a: "We're launching across Yorkshire, starting with Leeds, York, Wakefield, and surrounding postcodes. Enter yours at signup — we'll confirm availability.",
  },
  {
    q: "How does billing work?",
    a: "You subscribe online with a clear monthly or annual price. After your minimum term, get in touch if you need to make changes to your plan.",
  },
  {
    q: "Can I reschedule a visit?",
    a: "Yes. Log in to your account to reschedule or cancel a visit before your gardener is on the way.",
  },
  {
    q: "How do I get help?",
    a: "Use the chat on our website or message us through your customer account. We're happy to answer questions before and after you sign up.",
  },
];

export default function HomePage() {
  return (
    <>
      <HeroProductPreview />

      <Section
        id="how-it-works"
        title="How it works"
        subtitle="Garden care made simple — no chasing quotes or hunting for someone reliable each time."
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

      <section className="border-b border-gardens-primary/10 bg-white py-12">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3 md:text-center">
          {[
            ["Scheduled", "Regular visits through the season"],
            ["Local", "Approved gardeners in your area"],
            ["Online", "Manage visits in your account"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-3xl font-bold text-gardens-primary">{stat}</p>
              <p className="mt-2 text-sm text-stone-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Section
        id="pricing"
        title="Simple, transparent pricing"
        subtitle="Three plans. Annual billing is best value — save about two months vs paying monthly."
        className="bg-stone-50/80"
      >
        <PricingSection />
      </Section>

      <Section
        id="faq"
        title="Common questions"
        subtitle="Still unsure? Chat with us — we're happy to help before you sign up."
        className="border-t border-gardens-primary/10 bg-white"
      >
        <FaqAccordion items={faqs} />
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
