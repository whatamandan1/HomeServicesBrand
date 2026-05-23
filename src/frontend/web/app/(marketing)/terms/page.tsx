import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/marketing/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "Terms and conditions for GardensSorted garden care subscriptions.",
};

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of service"
      description="The agreement between you and GardensSorted when you subscribe to garden care."
      lastUpdated="23 May 2026"
    >
      <h2>1. About these terms</h2>
      <p>
        These terms apply when you sign up for a GardensSorted subscription at{" "}
        <Link href="/signup">gardenssorted.co.uk</Link> (or our current website address). By completing signup and
        payment, you agree to these terms and our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>2. The service</h2>
      <p>
        GardensSorted arranges recurring garden maintenance visits for residential properties in areas we cover. We
        schedule visits, match work to approved local gardeners, and provide an online account to view upcoming visits
        and contact support.
      </p>
      <p>
        Garden care is a service performed at your property. Results depend on weather, season, and the condition of
        your garden. We do not guarantee a specific visual outcome each visit, but we aim to deliver consistent
        maintenance as described in your plan.
      </p>

      <h2>3. Plans, pricing, and minimum terms</h2>
      <p>
        Plan names, prices, visit frequency, and minimum commitment periods are shown on our{" "}
        <Link href="/#pricing">pricing page</Link> and during signup before you pay. Monthly plans typically have a
        3-month minimum term; annual plans have a 12-month minimum term. Your minimum term end date is shown in your
        account.
      </p>
      <p>
        Prices include VAT where applicable. We may change prices for new customers; existing subscriptions keep their
        current price until you change plan or renew under new terms we notify you about.
      </p>

      <h2>4. Payment</h2>
      <p>
        Subscriptions are billed in advance through Stripe. You authorise recurring charges to your chosen payment
        method. If payment fails, we may suspend scheduling until your account is brought up to date.
      </p>
      <p>
        Invoices and payment method updates are available through the billing section of your customer portal (via
        Stripe&apos;s secure billing portal).
      </p>

      <h2>5. Visits, access, and rescheduling</h2>
      <p>
        You must provide accurate property details and safe access for gardeners. If we cannot access your property, the
        visit may be marked incomplete and we are not obliged to refund that visit.
      </p>
      <p>
        You can view upcoming visits in your account and request rescheduling through support where reasonable notice
        is given. Severe weather or operational issues may require us to reschedule visits.
      </p>

      <h2>6. Cancellation and changes</h2>
      <p>
        You may request cancellation by contacting customer support through your account chat. Cancellation is not
        available as a self-service button in the billing portal during your minimum term.
      </p>
      <p>
        If you cancel, service continues until the end of your minimum term or current billing period (whichever applies
        to your plan), and you remain liable for charges due up to that date. We do not generally offer refunds for
        partial periods already billed, except where required by law or at our discretion in exceptional circumstances.
      </p>

      <h2>7. Upgrades and plan changes</h2>
      <p>
        Where available in your account, you may upgrade plans or switch billing interval (e.g. monthly to annual).
        Changes may be prorated through Stripe. Downgrades are handled by support and may take effect at the next
        eligible billing date.
      </p>

      <h2>8. Gardeners</h2>
      <p>
        Gardeners who perform visits are independent contractors approved to use our platform. GardensSorted coordinates
        scheduling and customer billing; the gardener performs the agreed maintenance at your property.
      </p>

      <h2>9. Acceptable use</h2>
      <p>
        You must not misuse the service, provide false information, harass staff or gardeners, or use the platform for
        unlawful purposes. We may suspend or terminate accounts that breach these terms.
      </p>

      <h2>10. Liability</h2>
      <p>
        Nothing in these terms limits our liability for death or personal injury caused by negligence, fraud, or any
        other liability that cannot be excluded under UK law.
      </p>
      <p>
        Subject to the above, our total liability to you for any claim relating to the service is limited to the fees
        you paid to us in the 12 months before the claim. We are not liable for indirect or consequential loss (such as
        loss of profit) except where such exclusion is not permitted by law.
      </p>

      <h2>11. Complaints and contact</h2>
      <p>
        Contact us through your account support chat or email{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>. We aim to respond within a
        reasonable time.
      </p>

      <h2>12. Changes to these terms</h2>
      <p>
        We may update these terms. Material changes will be communicated by email or notice in your account. Continued
        use of the service after changes take effect constitutes acceptance where permitted by law.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of
        the courts of England and Wales, without prejudice to your statutory rights as a consumer.
      </p>
    </LegalDocument>
  );
}
