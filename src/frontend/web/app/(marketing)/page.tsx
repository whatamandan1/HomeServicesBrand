import Link from "next/link";
import type { Metadata } from "next";
import {
  CalendarCheck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { PricingSection } from "@/components/marketing/PricingSection";
import { HeroImage } from "@/components/marketing/HeroImage";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";

export const metadata: Metadata = {
  title: "Garden care subscriptions in Yorkshire",
  description:
    "Regular garden maintenance for Yorkshire homes. Subscribe online, choose your plan, and we schedule trusted local gardeners — from £29.95/month.",
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
  "Essential: monthly lawn, borders, and tidy",
  "Premium: twice-monthly visits plus hedges & beds",
  "Elite: 3 visits per month (~every 10 days) with Premium inclusions",
  "Pricing scales for small, medium, and large gardens",
  "Online account to view and manage every visit",
];

const faqs = [
  {
    q: "What's included in Essential?",
    a: "One visit each month: lawn mowing and edging, light border and bed tidy, and clippings removed. Manage visits and get support through your online account.",
  },
  {
    q: "What's included in Premium?",
    a: "Two visits each month (about every two weeks), plus everything in Essential — light hedge trim, bed weeding, and seasonal tidy work like leaves and light pruning.",
  },
  {
    q: "What's included in Elite?",
    a: "Three visits each month (about every 10 days), with everything in Premium. Best for fast-growing gardens or owners who want consistent upkeep through the season.",
  },
  {
    q: "How does garden size affect price?",
    a: "Small gardens are our base price (from £29.95/month Essential). Medium gardens add £10/month; large gardens add £20/month. Premium starts from £54.95/month and Elite from £89.95/month with the same uplifts. Annual plans use £100 medium / £200 large per year.",
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
      <section className="relative overflow-hidden bg-gradient-to-br from-gardens-dark via-gardens-primary to-gardens-primary">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(149,213,178,0.25),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:gap-12 sm:py-16 md:grid-cols-2 md:items-center md:py-28">
          <div className="text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gardens-accent backdrop-blur">
              <MapPin className="h-4 w-4 shrink-0" />
              Serving Yorkshire homeowners
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl text-balance">
              Your garden, looked after all year.
            </h1>
            <p className="mt-4 max-w-lg text-base text-gardens-accent/95 text-balance sm:mt-6 sm:text-lg">
              One simple subscription. We schedule regular visits and match you with trusted local gardeners — so you can enjoy your garden, not worry about it.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button href="/signup" className="w-full sm:w-auto !bg-white !text-gardens-dark hover:!bg-gardens-light">
                See plans & sign up
              </Button>
              <Button href="/#how-it-works" variant="secondary" className="w-full sm:w-auto !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
                How it works
              </Button>
            </div>
            <div className="mt-8 flex flex-col gap-3 text-sm text-gardens-accent/90 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-6">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Approved gardeners</span>
              <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Regular visits</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> From £29.95/month</span>
            </div>
          </div>

          <HeroImage className="max-md:order-last" />
        </div>
      </section>

      <Section
        id="how-it-works"
        title="How it works"
        subtitle="Garden care made simple — no chasing quotes or hunting for someone reliable each time."
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

      <section className="border-y border-gardens-primary/10 bg-gardens-light/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">What you get</p>
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
            ["Weekly", "Visits on a regular schedule"],
            ["Local", "Gardeners in your area"],
            ["Online", "Manage visits in your account"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="font-display text-3xl font-bold text-gardens-primary">{stat}</p>
              <p className="mt-2 text-sm text-stone-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <Section id="pricing" title="Simple, transparent pricing" subtitle="Three plans. No hidden fees. Clear minimum terms shown before you pay.">
        <PricingSection />
      </Section>

      <Section id="faq" title="Common questions" subtitle="Still unsure? Chat with us — we're happy to help before you sign up.">
        <div className="mx-auto max-w-2xl divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-soft">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-6">
              <h3 className="font-semibold text-gardens-dark">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{faq.a}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-stone-600">
          Have a question we haven&apos;t answered?{" "}
          <Link href="/#chat" className="font-medium text-gardens-primary hover:underline">
            Start a chat
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-medium text-gardens-primary hover:underline">
            begin signup
          </Link>
          .
        </p>
      </Section>

      <section className="bg-gardens-dark py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready for a garden you&apos;re proud of?</h2>
          <p className="mt-4 text-gardens-accent">Join Yorkshire homeowners who want reliable care without the hassle.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/signup" className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
              Get started
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
