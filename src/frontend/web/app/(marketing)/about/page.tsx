import Link from "next/link";
import type { Metadata } from "next";
import { CalendarCheck, Heart, MapPin, ShieldCheck, Users } from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";

export const metadata: Metadata = {
  title: "About us",
  description:
    "GardensSorted brings reliable subscription garden care to Yorkshire - trusted local gardeners, simple online signup, and visits you can manage from your account.",
};

const values = [
  {
    icon: Heart,
    title: "Reliability first",
    body: "Your garden deserves consistent care, not last-minute cancellations. We build schedules you can count on.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted gardeners",
    body: "Every gardener is approved only after ID, right-to-work, and basic DBS checks - before they take visits in your area.",
  },
  {
    icon: MapPin,
    title: "Local to Yorkshire",
    body: "We're starting where we know best - Leeds, York, Wakefield, and communities across the region.",
  },
  {
    icon: Users,
    title: "People, not platforms",
    body: "You'll know who's coming and when. Our team is here if you need to reschedule or have a question.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-gardens-light/50 to-stone-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">About GardensSorted</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-gardens-dark md:text-5xl text-balance">
            Garden care that fits modern life
          </h1>
          <p className="mt-6 text-lg text-stone-600 text-balance">
            We started GardensSorted because finding a dependable gardener shouldn&apos;t mean endless phone calls,
            vague quotes, and crossed fingers. Homeowners told us they wanted the same thing every time: someone
            reliable, on a regular schedule, at a fair price.
          </p>
        </div>
      </section>

      <Section
        title="What we do"
        subtitle="A subscription service for routine garden maintenance - not one-off landscaping projects."
      >
        <div className="mx-auto max-w-3xl space-y-6 text-stone-600 leading-relaxed">
          <p>
            You choose a plan, tell us about your garden and when you&apos;re usually available, and we handle the
            rest. Visits are scheduled in advance, matched to vetted local gardeners near you, and managed through your
            online account.
          </p>
          <p>
            It&apos;s the same idea as other subscriptions you already use - clear pricing upfront, regular service,
            and support when you need it. No haggling, no wondering if someone will turn up.
          </p>
        </div>
      </Section>

      <Section title="What matters to us">
        <div className="grid gap-6 md:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gardens-light text-gardens-primary">
                <v.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-gardens-dark">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{v.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="How a visit works">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          {[
            "Sign up with your address, garden size, and preferred visit times.",
            "We schedule recurring visits and assign a local gardener to your property.",
            "Your gardener completes the agreed maintenance during each visit.",
            "You can view upcoming visits, reschedule, or contact us through your account.",
          ].map((text, i) => (
            <div key={text} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-5 shadow-soft">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gardens-primary text-sm font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-stone-700">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-y border-gardens-primary/10 bg-gardens-dark py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <CalendarCheck className="mx-auto h-10 w-10 text-gardens-accent" aria-hidden />
          <h2 className="mt-4 font-display text-3xl font-bold">See if we cover your area</h2>
          <p className="mt-4 text-gardens-accent">
            Enter your postcode in our quote flow and we&apos;ll confirm availability and show your personalised price.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/signup" className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
              Get your quote
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <Link href="/" className="text-sm font-medium text-gardens-primary hover:underline">
          ← Back to homepage
        </Link>
      </section>
    </>
  );
}
