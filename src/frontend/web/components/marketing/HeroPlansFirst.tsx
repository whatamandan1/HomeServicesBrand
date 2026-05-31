import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  findTierPlanForBilling,
  planPriceForGarden,
  PLAN_TIERS,
  type PlanTier,
} from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";
import { FALLBACK_PLANS, planSignupHref } from "@/lib/plans";
import { Button } from "@/components/marketing/ui";

const VISITS_BY_TIER: Record<PlanTier, string> = {
  essential: "10 visits per year",
  premium: "20 visits per year",
  elite: "30 visits per year",
};

export function HeroPlansFirst() {
  const tiers = PLAN_TIERS.map((tier) => {
    const plan = findTierPlanForBilling(FALLBACK_PLANS, tier.id, "Monthly");
    const monthlyFrom = plan ? planPriceForGarden(plan, "Small") : 0;
    return {
      ...tier,
      visits: VISITS_BY_TIER[tier.id],
      priceLabel: plan ? `From £${formatGbp(monthlyFrom)}/mo` : "",
      href: planSignupHref(FALLBACK_PLANS, tier.id),
    };
  });

  return (
    <section className="border-b border-stone-200 bg-gardens-light/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:py-14 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-gardens-primary/15 bg-white px-4 py-1.5 text-sm font-medium text-gardens-dark shadow-sm">
            <MapPin className="h-4 w-4 shrink-0 text-gardens-primary" />
            Yorkshire · Leeds, York, Wakefield
          </p>
          <p className="mt-5 text-sm font-semibold text-gardens-primary">Three plans · simple monthly pricing</p>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-gardens-dark sm:text-4xl md:text-5xl text-balance">
            Pick a plan. We visit on schedule.
          </h1>
          <p className="mt-4 text-base text-stone-600 text-balance sm:text-lg">
            Essential, Premium, or Elite — priced by garden size. Sign up in minutes, we handle the rest.
          </p>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:mt-10 sm:grid-cols-3">
          {tiers.map((tier) => {
            const isPremium = tier.id === "premium";
            return (
              <Link
                key={tier.id}
                href={tier.href}
                className={`relative flex flex-col rounded-2xl border bg-white p-5 text-left shadow-soft transition hover:border-gardens-primary/30 hover:shadow-md ${
                  isPremium
                    ? "border-gardens-primary ring-2 ring-gardens-primary/15"
                    : "border-stone-200"
                }`}
              >
                {isPremium && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full bg-gardens-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">{tier.label}</p>
                <p className="mt-1 text-sm text-stone-600">{tier.tagline}</p>
                <p className="mt-3 text-sm font-medium text-stone-700">{tier.visits}</p>
                <p className="mt-4 font-display text-2xl font-bold text-gardens-dark">{tier.priceLabel}</p>
                <p className="mt-1 text-xs text-stone-500">Small garden · billed monthly</p>
                <span className="mt-4 text-sm font-semibold text-gardens-primary">Choose {tier.label} →</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button href="/#pricing" className="w-full sm:w-auto">
            Compare plans & sign up
          </Button>
          <Button href="/#how-it-works" variant="secondary" className="w-full sm:w-auto">
            How it works
          </Button>
        </div>
      </div>
    </section>
  );
}
