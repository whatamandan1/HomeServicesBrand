import type { Metadata } from "next";
import { Building2, Calendar, ClipboardList, Wallet } from "lucide-react";
import { Button, Section } from "@/components/marketing/ui";
import { PortfolioEnquiryForm } from "@/components/portfolios/PortfolioEnquiryForm";

export const metadata: Metadata = {
  title: "For landlords - multi-property garden care",
  description:
    "Garden maintenance for landlords, letting agents, and multi-property owners across Yorkshire. One account, personalised pricing, monthly invoicing.",
};

const benefits = [
  {
    icon: Building2,
    title: "One account, every property",
    body: "Manage two holiday lets or dozens of rentals from a single account - tenants never need to sign up.",
  },
  {
    icon: ClipboardList,
    title: "Personalised plans",
    body: "Visit frequency and service level can differ per property. We quote based on your properties, not one-size-fits-all tiers.",
  },
  {
    icon: Wallet,
    title: "Simple billing",
    body: "Monthly invoicing in arrears. Pay by card for smaller accounts or BACS when your monthly total is £200 or more.",
  },
  {
    icon: Calendar,
    title: "Same gardeners, less hassle",
    body: "We match visits to your properties across our vetted gardener network in your area.",
  },
];

export default function MultiPropertySolutionsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-gardens-light/50 to-stone-50 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">For landlords</p>
          <h1 className="mt-4 font-display text-4xl font-bold text-gardens-dark md:text-5xl text-balance">
            Garden care for every property you manage
          </h1>
          <p className="mt-6 text-lg text-stone-600 text-balance">
            Whether you own two holiday lets or manage dozens of rentals, tell us about your properties and we&apos;ll put together a personalised plan and price.
          </p>
          <div className="mt-8">
            <Button href="#request-quote">Request a quote</Button>
          </div>
        </div>
      </section>

      <Section
        title="Built for multi-property owners and managers"
        subtitle="Private landlords, letting agents, and holiday-let owners - minimum two properties."
      >
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
        title="How it works"
        subtitle="Request a quote today - we'll follow up with a personalised indicative price."
      >
        <ol className="mx-auto max-w-2xl space-y-4 text-sm text-stone-600">
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <span className="font-semibold text-gardens-dark">1. Tell us about your properties</span>
            <p className="mt-1">Add at least two addresses with garden sizes. Optional company name and notes.</p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <span className="font-semibold text-gardens-dark">2. We review your properties</span>
            <p className="mt-1">Our team checks coverage and puts together a personalised indicative quote.</p>
          </li>
          <li className="rounded-xl border border-stone-200 bg-white p-4">
            <span className="font-semibold text-gardens-dark">3. Confirm and go live</span>
            <p className="mt-1">Once agreed, your account is set up with per-property visit schedules and monthly invoicing.</p>
          </li>
        </ol>
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs text-stone-500">
          Prices shown during quoting are indicative and subject to review before any agreement is confirmed.
        </p>
      </Section>

      <PortfolioEnquiryForm />
    </>
  );
}
