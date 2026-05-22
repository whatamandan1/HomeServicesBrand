import Link from "next/link";
import {
  CalendarCheck,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { PricingSection } from "@/components/marketing/PricingSection";
import { HeroVisual } from "@/components/marketing/HeroVisual";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";

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
    title: "Local gardeners claim work",
    body: "Approved providers in your postcode sector claim visits. You always know who's coming.",
  },
];

const faqs = [
  {
    q: "What's included?",
    a: "Regular garden maintenance visits on a subscription — lawn, borders, and general upkeep depending on your garden size.",
  },
  {
    q: "Can I cancel?",
    a: "Plans have a minimum term. After that, manage changes through your customer portal or support chat.",
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
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
          <div className="text-white">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gardens-accent backdrop-blur">
              <MapPin className="h-4 w-4" />
              Now launching in Yorkshire
            </p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl text-balance">
              Garden care, sorted.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-gardens-accent/95 text-balance">
              Subscribe once. We handle scheduling, dispatch, and your local gardener — so your garden stays sorted all year.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/signup" className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
                Start your subscription
              </Button>
              <Button href="/#how-it-works" variant="secondary" className="!border-white/30 !bg-white/10 !text-white hover:!bg-white/20">
                See how it works
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-gardens-accent/90">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Vetted gardeners</span>
              <span className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> AI support in portal</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> From £49/month</span>
            </div>
          </div>

          <HeroVisual />
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
              ["500+", "Gardens we’re building for"],
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

      <Section title="Built on Sorted" subtitle="GardensSorted is the first brand on the Sorted platform — infrastructure for recurring home services.">
        <div className="mx-auto max-w-3xl rounded-2xl border border-gardens-primary/20 bg-white p-8 shadow-soft md:p-10">
          <p className="text-stone-600 leading-relaxed">
            Sorted powers subscription signup, payments, scheduling, provider dispatch, and customer support —
            so each vertical (gardens today, more services tomorrow) launches faster with shared tech.
            Investors see a repeatable playbook, not a one-off gardening website.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Stripe billing", "Provider marketplace", "Admin CRM", "AI support"].map((tag) => (
              <span key={tag} className="rounded-full bg-gardens-light px-4 py-1.5 text-xs font-semibold text-gardens-dark">
                {tag}
              </span>
            ))}
          </div>
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
    </>
  );
}
