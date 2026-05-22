import Link from "next/link";
import { Banknote, Calendar, MapPin, Shield } from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { ProviderSignupForm } from "@/components/providers/ProviderSignupForm";

export const metadata = { title: "For gardeners" };

const benefits = [
  {
    icon: MapPin,
    title: "Work in your area",
    body: "Claim visits in postcode sectors you choose — no driving across the county for one job.",
  },
  {
    icon: Calendar,
    title: "Recurring routes",
    body: "Subscriptions mean repeat visits on predictable dates. Build a route, not a scatter of one-offs.",
  },
  {
    icon: Banknote,
    title: "Fair, transparent pay",
    body: "Sorted handles customer billing. You focus on great gardening — we handle admin and dispatch.",
  },
  {
    icon: Shield,
    title: "Approved network",
    body: "Join a vetted provider network with support from the Sorted platform team.",
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

      <ProviderSignupForm />
    </>
  );
}
