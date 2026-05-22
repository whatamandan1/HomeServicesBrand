import Link from "next/link";
import {
  CalendarCheck,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { PricingSection } from "@/components/marketing/PricingSection";
import { HeroImage } from "@/components/marketing/HeroImage";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { GuestChatFab, SupportChat } from "@/components/support/SupportChat";

const steps = [
  {
    icon: Sparkles,
    title: "Pick your plan",
    body: "Choose monthly or annual garden care. Sign up in minutes with your address and availability.",
  },
  {
    icon: CalendarCheck,
    title: "We schedule visits",
    body: "Recurring visits land in your preferred window — weekday mornings, afternoons, or weekends.",
  },
  {
    icon: Users,
    title: "Local gardeners visit",
    body: "Approved gardeners in your area take on your visits. You always know who's coming and when.",
  },
];

const faqs = [
  {
    q: "What's included?",
    a: "Regular garden maintenance visits on a subscription — lawn, borders, and general upkeep depending on your garden size.",
  },
  {
    q: "Can I cancel?",
    a: "Plans have a minimum term. After that, manage changes through your account or get in touch with our team.",
  },
  {
    q: "Where do you operate?",
    a: "Launching across Yorkshire, starting with Leeds, York, and surrounding areas.",
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
              Now launching in Yorkshire
            </p>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight sm:mt-6 sm:text-4xl md:text-5xl lg:text-6xl text-balance">
              Garden care, sorted.
            </h1>
            <p className="mt-4 max-w-lg text-base text-gardens-accent/95 text-balance sm:mt-6 sm:text-lg">
              Subscribe once. We handle scheduling and your local gardener — so your garden stays sorted all year.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button href="/signup" className="w-full sm:w-auto !bg-white !text-gardens-dark hover:!bg-gardens-light">
                Start your subscription
              </Button>
              <Button href="/#how-it-works" variant="secondary" className="w-full sm:w-auto !border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
                See how it works
              </Button>
            </div>
            <div className="mt-8 flex flex-col gap-3 text-sm text-gardens-accent/90 sm:mt-10 sm:flex-row sm:flex-wrap sm:gap-6">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Vetted gardeners</span>
              <span className="flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Recurring visits</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> From £49/month</span>
            </div>
          </div>

          <HeroImage className="max-md:order-last" />
        </div>
      </section>

      <Section
        id="how-it-works"
        title="How GardensSorted works"
        subtitle="Subscription garden care without the hassle of finding and chasing a gardener every time."
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
          <div className="grid gap-10 md:grid-cols-3 md:text-center">
            {[
              ["500+", "Gardens we're building for"],
              ["100%", "Subscription — no one-off quotes"],
              ["Local", "Yorkshire gardeners, your area"],
            ].map(([stat, label]) => (
              <div key={label}>
                <p className="font-display text-4xl font-bold text-gardens-primary">{stat}</p>
                <p className="mt-2 text-sm text-stone-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section id="pricing" title="Simple, transparent pricing" subtitle="Two plans. No hidden fees. Cancel after your minimum term.">
        <PricingSection />
      </Section>

      <Section
        id="chat"
        title="Questions? Chat with us"
        subtitle="Ask about pricing, coverage, or how GardensSorted works — no signup required."
      >
        <div className="mx-auto max-w-2xl">
          <SupportChat
            mode="guest"
            title="Live chat"
            subtitle="AI assistant · answers instantly"
          />
        </div>
      </Section>

      <Section title="Questions" subtitle="Quick answers before you sign up.">
        <div className="mx-auto max-w-2xl divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-soft">
          {faqs.map((faq) => (
            <div key={faq.q} className="p-6">
              <h3 className="font-semibold text-gardens-dark">{faq.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="bg-gardens-dark py-20 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-display text-3xl font-bold md:text-4xl">Ready to sort your garden?</h2>
          <p className="mt-4 text-gardens-accent">Join Yorkshire homeowners who want reliable, recurring garden care.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/signup" className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
              Get started
            </Button>
            <Link
              href="/providers"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Become a gardener
            </Link>
          </div>
        </div>
      </section>

      <GuestChatFab />
    </>
  );
}
