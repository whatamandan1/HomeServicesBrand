import Link from "next/link";
import { GARDEN_SIZE_GUIDE, GARDEN_SIZE_ORDER } from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";
import { PRIMARY_CTA_HREF, PRIMARY_CTA_LABEL } from "@/lib/marketing-cta";
import { Button, Section } from "@/components/marketing/ui";

type MarketingPricingTeaserProps = {
  /** Optional city name for local landing pages, e.g. "Leeds". */
  cityLabel?: string;
};

export function MarketingPricingTeaser({ cityLabel }: MarketingPricingTeaserProps) {
  const subtitle = cityLabel
    ? `Monthly garden care in ${cityLabel} - priced by the lawn and beds we maintain.`
    : "Monthly garden care - priced by the lawn and beds we maintain, not your whole plot.";

  return (
    <Section
      id="pricing"
      title="Garden care pricing"
      subtitle={subtitle}
      className="scroll-mt-24 border-b border-gardens-primary/10 bg-white"
    >
      <p className="mx-auto -mt-4 mb-8 max-w-2xl text-center text-sm text-stone-600">
        <strong>10 visits per year</strong> (~every 5–6 weeks) · Billed monthly ·{" "}
        <strong>3-month minimum term</strong> on garden care · See your exact quote before you pay
      </p>
      <div className="grid gap-6 md:grid-cols-3">
        {GARDEN_SIZE_ORDER.map((size) => {
          const guide = GARDEN_SIZE_GUIDE[size];
          return (
            <div
              key={size}
              className="rounded-2xl border border-stone-200 bg-stone-50/50 p-6 shadow-soft"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
                {guide.shortName} garden
              </p>
              <p className="mt-1 font-display text-2xl font-semibold text-gardens-dark">
                £{formatGbp(guide.monthlyPrice)}
                <span className="text-base font-normal text-stone-500">/month</span>
              </p>
              <p className="mt-2 text-sm text-stone-600">{guide.label} maintained</p>
              <p className="mt-1 text-xs text-stone-500">{guide.examples}</p>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">
        Gardens over 150 m² maintained?{" "}
        <Link href={PRIMARY_CTA_HREF} className="font-medium text-gardens-primary hover:underline">
          Contact us for a quote
        </Link>
        .
      </p>
      <div className="mt-8 flex justify-center">
        <Button href={PRIMARY_CTA_HREF}>{PRIMARY_CTA_LABEL}</Button>
      </div>
    </Section>
  );
}
