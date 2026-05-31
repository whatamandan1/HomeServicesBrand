import Link from "next/link";
import type { Metadata } from "next";
import { Banknote, Calendar, MapPin, Shield } from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { ProviderSignupForm } from "@/components/providers/ProviderSignupForm";
import {
  PROVIDER_ADDON_EQUIPMENT,
  PROVIDER_ADDON_EQUIPMENT_SUMMARY,
  PROVIDER_EQUIPMENT_REQUIRED,
  PROVIDER_VETTING_REQUIRED,
} from "@/lib/provider-requirements";

export const metadata: Metadata = {
  title: "Work with GardensSorted",
  description:
    "Join our network of approved gardeners in Yorkshire. Claim recurring visits in your area and build a reliable route.",
};

const benefits = [
  {
    icon: MapPin,
    title: "Work in your area",
    body: "Claim visits within a radius of your base postcode - no driving across the county for one job.",
  },
  {
    icon: Calendar,
    title: "Recurring routes",
    body: "Subscriptions mean repeat visits on predictable dates. Build a route, not a scatter of one-offs.",
  },
  {
    icon: Banknote,
    title: "Fair, transparent pay",
    body: "GardensSorted handles customer billing. You focus on great gardening - we handle scheduling and dispatch.",
  },
  {
    icon: Shield,
    title: "Approved network",
    body: "ID, right-to-work, DBS, and your own relevant insurance verified before approval - plus support when you need it.",
  },
];

export default function ProvidersPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-gardens-light/50 to-stone-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">For gardeners</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-gardens-dark md:text-5xl text-balance">
            Steady garden work, in your patch.
          </h1>
          <p className="mt-6 text-lg text-stone-600 text-balance">
            GardensSorted connects you with subscription customers in your area. Claim visits through the provider portal when they fit your schedule.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="#apply">Apply to join</Button>
            <Link
              href="/login"
              className="inline-flex min-h-[48px] items-center rounded-full border border-stone-200 px-6 py-3 text-sm font-semibold text-stone-700 transition hover:bg-white"
            >
              Provider login
            </Link>
          </div>
        </div>
      </section>

      <Section title="Why join GardensSorted?" subtitle="We're building the gardener side of subscription home services.">
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gardens-light text-gardens-primary">
                <b.icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold text-gardens-dark">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{b.body}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Before you're approved"
        subtitle="We verify every gardener before they join the network."
      >
        <ul className="mx-auto max-w-2xl space-y-2 text-sm text-stone-700">
          {PROVIDER_VETTING_REQUIRED.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-gardens-primary" aria-hidden>
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-stone-600">
          Sign up first, then complete the checks &amp; documents form in your provider portal - approval only after we
          verify ID, right to work, DBS, and insurance.
        </p>
      </Section>

      <Section
        title="Equipment you must bring"
        subtitle="Every visit - we don't supply tools. Customers provide water and electricity access; you bring your own gear including a 20 m+ extension lead."
      >
        <ul className="mx-auto max-w-2xl space-y-2 text-sm text-stone-700">
          {PROVIDER_EQUIPMENT_REQUIRED.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-gardens-primary" aria-hidden>
                •
              </span>
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Add-on equipment (optional)"
        subtitle="Declare what you own in the portal after signup - we match you to the right customer add-ons."
      >
        <p className="mx-auto max-w-2xl text-sm text-stone-600">{PROVIDER_ADDON_EQUIPMENT_SUMMARY}</p>
        <ul className="mx-auto mt-4 max-w-2xl space-y-3 text-sm text-stone-700">
          {PROVIDER_ADDON_EQUIPMENT.map((item) => (
            <li key={item.field} className="rounded-lg border border-stone-200 bg-white px-4 py-3">
              <p className="font-medium text-gardens-dark">{item.label}</p>
              <p className="mt-1 text-stone-600">{item.enables}</p>
              <p className="mt-1 text-xs text-stone-500">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Section>

      <ProviderSignupForm />
    </>
  );
}
