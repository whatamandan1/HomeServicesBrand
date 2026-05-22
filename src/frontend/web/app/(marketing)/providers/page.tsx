import Link from "next/link";
import { Banknote, Calendar, MapPin, Shield } from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";

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
          <div className="mt-8">
            <Button href="/login">Provider login</Button>
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

      <section className="pb-20">
        <div className="mx-auto max-w-xl rounded-2xl border border-gardens-primary/20 bg-white p-8 text-center shadow-soft">
          <h2 className="font-display text-2xl font-semibold text-gardens-dark">Interested in joining?</h2>
          <p className="mt-3 text-sm text-stone-600">
            Provider onboarding is opening in Yorkshire. Log in with your provider account, or contact us to register interest.
          </p>
          <Link href="/login" className="mt-6 inline-block text-sm font-semibold text-gardens-primary hover:underline">
            Go to provider login →
          </Link>
        </div>
      </section>
    </>
  );
}
