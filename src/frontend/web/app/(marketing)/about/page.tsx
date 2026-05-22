import Link from "next/link";
import {
  CalendarCheck,
  CreditCard,
  LayoutDashboard,
  MessageCircle,
  Sparkles,
  Users,
} from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";

export const metadata = { title: "About Sorted" };

const platformFeatures = [
  {
    icon: CreditCard,
    title: "Subscription billing",
    body: "Stripe-powered signup, checkout, and webhooks — customers subscribe online without manual invoicing.",
  },
  {
    icon: CalendarCheck,
    title: "Visit scheduling",
    body: "Recurring visits generated from each subscription, opened for local providers to claim in their area.",
  },
  {
    icon: Users,
    title: "Provider marketplace",
    body: "Approved gardeners see open visits by postcode sector and claim work that fits their route.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin CRM",
    body: "Customers, providers, visits, and escalations in one dashboard — operational visibility from day one.",
  },
  {
    icon: MessageCircle,
    title: "AI customer support",
    body: "In-portal chat with account context, conversation history, and human escalation when needed.",
  },
  {
    icon: Sparkles,
    title: "Multi-brand ready",
    body: "Shared infrastructure so new home-service verticals can launch faster under the Sorted umbrella.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-gardens-light/50 to-stone-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">For investors & partners</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-gardens-dark md:text-5xl text-balance">
            GardensSorted is the first brand on Sorted
          </h1>
          <p className="mt-6 text-lg text-stone-600 text-balance">
            Sorted is subscription infrastructure for recurring home services — billing, scheduling, provider dispatch,
            and customer support in one platform. GardensSorted proves the model in gardening; the playbook repeats.
          </p>
        </div>
      </section>

      <Section
        title="The platform story"
        subtitle="A modular monolith built for speed now and scale later — not a one-off gardening website."
      >
        <div className="mx-auto max-w-3xl space-y-6 text-stone-600 leading-relaxed">
          <p>
            Home services are still mostly one-off quotes, phone calls, and chasing tradespeople. Sorted flips that into
            subscriptions: customers sign up online, visits run on a schedule, and local providers claim work through a
            marketplace layer.
          </p>
          <p>
            GardensSorted is the live first vertical — Yorkshire garden care at £29.95/month or £299.95/year. The same backend
            powers customer signup, Stripe payments, visit generation, provider claiming, admin CRM, and AI support chat.
          </p>
          <p>
            Future brands (cleaning, maintenance, and more) reuse the core platform with new branding, plans, and provider
            networks — faster go-to-market than rebuilding from scratch each time.
          </p>
        </div>
      </Section>

      <Section title="What's built today" subtitle="Live on staging — demo the full flow in a investor meeting.">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gardens-light text-gardens-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-gardens-dark">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <section className="border-y border-gardens-primary/10 bg-gardens-dark py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="font-display text-3xl font-bold">See it in action</h2>
          <p className="mt-4 text-gardens-accent">
            Walk through the customer site, live portal, provider dispatch, and admin CRM — or start from the public
            GardensSorted homepage.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/signup" className="!bg-white !text-gardens-dark hover:!bg-gardens-light">
              Customer signup flow
            </Button>
            <Link
              href="/login"
              className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Admin / provider login
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <Link href="/" className="text-sm font-medium text-gardens-primary hover:underline">
          ← Back to GardensSorted homepage
        </Link>
      </section>
    </>
  );
}
