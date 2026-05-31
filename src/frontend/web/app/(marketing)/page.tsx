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
import { ServicePillarsSection } from "@/components/marketing/ServicePillarsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY } from "@/lib/consumer-plans";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";

export const metadata: Metadata = {
  title: "Garden care subscriptions in Yorkshire",
  description:
    "Regular garden maintenance for Yorkshire homes. Pick your garden size, add optional extras, and we schedule trusted local gardeners.",
  openGraph: {
    title: "GardensSorted - Garden care subscriptions in Yorkshire",
    description:
      "Regular garden maintenance for Yorkshire homes. Subscribe online and we handle scheduling.",
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
    body: "Approved local gardeners take on your visits. View upcoming dates and details anytime in your online account.",
  },
];

const included = [
  "10 visits per year - lawn, borders, and tidy on each visit",
  "Priced by garden size, up to 150 m² maintained",
  "Optional add-ons: hedges, seasonal tidy, patio refresh",
  "Online account to view and manage every visit",
];

const faqs = [
  {
    q: "What's included in garden care?",
    a: "10 visits per year, about every 5–6 weeks: lawn mowing and edging, weeding, general tidy, and light watering on each visit. You need a working outdoor tap; we bring hose or watering can. You dispose of clippings or leave your garden-waste bin out. Manage everything in your online account.",
  },
  {
    q: "How does garden size affect price?",
    a: "We price by the lawn and beds we maintain, not your whole plot, plus how often you want visits and any add-ons you choose. Use Get your quote to see your personalised monthly price before you pay. Above 150 m² maintained we quote separately.",
  },
  {
    q: "What add-ons can I choose?",
    a: "At signup you can add hedge trim 4× per year, seasonal tidy and leaf clearance 4× per year, or patio and path refresh 2× per year. Add-ons require a 6-month minimum term on monthly billing.",
  },
  {
    q: "What do I need to prepare before a visit?",
    a: `${CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY} See our terms for the full list.`,
  },
  {
    q: "Can I hire my gardener directly?",
    a: "Your subscription covers visits arranged through GardensSorted. While you're subscribed, and for 12 months after your last platform visit, you agree not to hire gardeners we introduced to you for the same work off-platform without our consent - that protects scheduling and fair pay. Other local gardeners you've never booked through us are fine.",
  },
  {
    q: "What's not included?",
    a: "Major clearance, tree surgery, tall hedge reduction, and landscaping. We don't make separate trips just for watering, patio cleaning, leaf blowing, or gutter clearing - but we can quote those as seasonal add-ons.",
  },
  {
    q: "Do you water the garden?",
    a: "Yes - light watering of pots, beds, and dry spots while we're on site. You need a working outdoor tap; we bring hose or watering can. We don't make extra trips just to water between visits.",
  },
  {
    q: "Can you clean the patio, blow leaves, or clear gutters?",
    a: "On regular visits we'll lightly sweep garden-adjacent paving and do light leaf work in the maintained area when we're there. Thorough patio cleaning, dedicated seasonal leaf clearance, and gutter clearing are optional add-ons at signup.",
  },
  {
    q: "Which areas do you cover?",
    a: "We're launching across Yorkshire, starting with Leeds, York, Wakefield, and surrounding postcodes. Enter yours at signup - we'll confirm availability.",
  },
  {
    q: "How does billing work?",
    a: "You subscribe online with a clear monthly price for your garden size and any add-ons you chose. After your minimum term, get in touch if you need to make changes.",
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
        subtitle="Garden care made simple - no chasing quotes or hunting for someone reliable each time."
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
