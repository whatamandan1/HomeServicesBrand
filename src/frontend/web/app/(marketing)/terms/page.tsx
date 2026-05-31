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
      lastUpdated="30 May 2026"
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
        On each scheduled visit, your plan includes routine maintenance within the maintained area you selected at
        signup: <strong>lawn mowing and edging</strong>, <strong>weeding in borders and planted beds</strong>,{" "}
        <strong>general garden clean-up and tidy</strong>, and <strong>light watering</strong> of pots, beds, and obvious
        dry spots while we are on site (when you provide access to water).
        Premium and Elite plans add visit frequency and extra tasks shown on our pricing page (such as light hedge work
        or seasonal tidy). We do not guarantee a specific visual outcome each visit — results depend on weather,
        season, and garden condition — but we aim to deliver consistent maintenance as described in your plan.
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

      <h2>5. Your responsibilities before each visit</h2>
      <p>You agree to prepare your property so gardeners can work safely and efficiently:</p>
      <ul>
        <li>
          <strong>Green waste:</strong> You must either dispose of grass cuttings and green waste yourself, or provide a
          suitable council garden-waste bin that we may fill on collection day. We do not routinely haul waste off site.
        </li>
        <li>
          <strong>Clear the work area:</strong> Remove obstructions from the lawn and garden we maintain (furniture, toys,
          tools, fallen branches, and similar items).
        </li>
        <li>
          <strong>Pet waste:</strong> Remove or secure pet waste from maintained areas before the visit.
        </li>
        <li>
          <strong>Access:</strong> Provide safe, unobstructed access to the garden (for example unlocked gates, clear
          paths, and pets secured away from work areas).
        </li>
        <li>
          <strong>Water:</strong> Provide access to water for light watering during the visit — typically a working
          outdoor tap that reaches the maintained areas. Your gardener brings their own hose or watering can. If you do
          not have a suitable supply, tell us before signup; we may skip watering on that visit.
        </li>
        <li>
          <strong>Power:</strong> Provide an outdoor electricity supply where electric tools are needed (for example a
          weatherproof outdoor socket, or an extension lead from your property that reaches the garden safely).
        </li>
        <li>
          <strong>Accurate details:</strong> Keep your address, garden size band, and access instructions up to date in
          your account.
        </li>
      </ul>
      <p>
        If we cannot access your property, work safely, or complete maintenance because these conditions are not met, the
        visit may be marked incomplete and we are not obliged to refund that visit.
      </p>

      <h2>6. Visits and rescheduling</h2>
      <p>
        You can view upcoming visits in your account and request rescheduling through support where reasonable notice
        is given. Severe weather or operational issues may require us to reschedule visits.
      </p>

      <h2>7. Cancellation and changes</h2>
      <p>
        You may request cancellation by contacting customer support through your account chat. Cancellation is not
        available as a self-service button in the billing portal during your minimum term.
      </p>
      <p>
        If you cancel, service continues until the end of your minimum term or current billing period (whichever applies
        to your plan), and you remain liable for charges due up to that date. We do not generally offer refunds for
        partial periods already billed, except where required by law or at our discretion in exceptional circumstances.
      </p>

      <h2>8. Upgrades and plan changes</h2>
      <p>
        Where available in your account, you may upgrade plans or switch billing interval (e.g. monthly to annual).
        Changes may be prorated through Stripe. Downgrades are handled by support and may take effect at the next
        eligible billing date.
      </p>

      <h2>9. Gardeners and off-platform work</h2>
      <p>
        Gardeners who perform visits are independent contractors approved to use our platform. GardensSorted coordinates
        scheduling, customer billing, and quality standards; the gardener performs the agreed maintenance at your
        property. Before approval, gardeners must provide valid photo ID, pass right-to-work verification in the UK, and
        pass a basic DBS check. Approved gardeners bring their own equipment to each visit (including mower, edging tool
        or strimmer, watering can or hose, rake, and appropriate brush). We do not supply tools.
      </p>
      <p>
        To protect our service and the gardeners who rely on it, you agree that while you have an active subscription, and
        for <strong>twelve (12) months</strong> after your last visit arranged through GardensSorted, you will not engage,
        hire, or pay any gardener who was introduced to you through our service to perform garden maintenance or similar
        work at your property <strong>outside</strong> GardensSorted without our prior written consent. If you wish to
        continue with the same gardener independently, contact us first — we may agree a handover or continuation
        arrangement.
      </p>
      <p>
        Cancelling your subscription to avoid platform fees while continuing the same arranged visits off-platform is
        not permitted. Breach of this section may result in immediate suspension or termination, and you may remain
        liable for fees due under your minimum term. Nothing in this section prevents you from using other gardeners who
        were not introduced through GardensSorted.
      </p>

      <h2>10. Acceptable use</h2>
      <p>
        You must not misuse the service, provide false information, harass staff or gardeners, or use the platform for
        unlawful purposes. We may suspend or terminate accounts that breach these terms.
      </p>

      <h2>11. Liability</h2>
      <p>
        Nothing in these terms limits our liability for death or personal injury caused by negligence, fraud, or any
        other liability that cannot be excluded under UK law.
      </p>
      <p>
        Subject to the above, our total liability to you for any claim relating to the service is limited to the fees
        you paid to us in the 12 months before the claim. We are not liable for indirect or consequential loss (such as
        loss of profit) except where such exclusion is not permitted by law.
      </p>

      <h2>12. Complaints and contact</h2>
      <p>
        Contact us through your account support chat or email{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>. We aim to respond within a
        reasonable time.
      </p>

      <h2>13. Changes to these terms</h2>
      <p>
        We may update these terms. Material changes will be communicated by email or notice in your account. Continued
        use of the service after changes take effect constitutes acceptance where permitted by law.
      </p>

      <h2>14. Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of
        the courts of England and Wales, without prejudice to your statutory rights as a consumer.
      </p>
    </LegalDocument>
  );
}
