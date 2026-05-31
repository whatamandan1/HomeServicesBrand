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
        <Link href="/signup">gardenssorted.co.uk</Link> or our current website. By completing signup and
        payment, you agree to these terms and our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>2. The service</h2>
      <p>
        GardensSorted arranges recurring garden maintenance visits for residential properties in postcodes we actively
        cover (shown during signup). We schedule visits, match work to approved local gardeners, and provide an online
        account to view upcoming visits and contact support. If we cannot serve your address, we will tell you before you
        pay.
      </p>
      <p>
        On each scheduled visit, your plan includes routine maintenance within the maintained area you selected at
        signup: <strong>lawn mowing and edging</strong>, <strong>weeding in borders and planted beds</strong>,{" "}
        <strong>general garden clean-up and tidy</strong>, and <strong>light watering</strong> of pots, beds, and obvious
        dry spots while we are on site when you provide water access.
        Optional add-ons at signup, such as hedge trim, seasonal tidy, or patio refresh, are delivered on a separate
        schedule shown in your quote at signup. We do not guarantee a specific visual outcome each visit. Results depend on weather,
        season, and garden condition, but we aim to deliver consistent maintenance as described in your plan.
      </p>

      <h2>3. Plans, pricing, and minimum terms</h2>
      <p>
        Plan names, prices, visit frequency, and minimum commitment periods are shown in our{" "}
        <Link href="/signup">quote flow</Link> before you pay.
      </p>
      <ul>
        <li>
          <strong>Monthly billing, core maintenance only:</strong> typically a <strong>3-month</strong> minimum term.
        </li>
        <li>
          <strong>Monthly billing with signup add-ons</strong> (hedge trim, seasonal tidy, or patio refresh): a{" "}
          <strong>6-month</strong> minimum term applies to that subscription.
        </li>
        <li>
          <strong>Annual billing:</strong> a <strong>12-month</strong> minimum term.
        </li>
      </ul>
      <p>
        Your minimum term end date is shown in your account and set when you subscribe, based on the plan and add-ons
        you selected at signup.
      </p>
      <p>
        Signup add-ons are delivered on a fixed schedule, not on every maintenance visit. Hedge and seasonal work is
        typically <strong>four times per year</strong>; patio and path refresh is typically <strong>twice per year</strong>.
        The monthly subscription charge spreads that annual cost evenly over twelve months.
      </p>
      <p>
        Prices include VAT where applicable. We may change prices for new customers; existing subscriptions keep their
        current price until you change plan or renew under new terms we notify you about.
      </p>

      <h2>4. Quotes, signup, and photos</h2>
      <p>
        Prices and visit frequency shown in the quote flow are the price you agree to pay for your selected garden size
        and add-ons at checkout, subject to VAT as stated. If you enter your email before completing signup, we may save
        your progress and email your quote or reminders; see our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
      <p>
        You may upload optional garden photos after signup to help gardeners prepare. You confirm you have the right to
        share those images and that they accurately represent the areas we will maintain.
      </p>

      <h2>5. Payment</h2>
      <p>
        Subscriptions are billed in advance through Stripe. You authorise recurring charges to your chosen payment
        method. If payment fails, we may suspend scheduling until your account is brought up to date.
      </p>
      <p>
        Invoices and payment method updates are available through the billing section of your customer portal (via
        Stripe&apos;s secure billing portal).
      </p>

      <h2>6. Your responsibilities before each visit</h2>
      <p>You agree to prepare your property so gardeners can work safely and efficiently:</p>
      <ul>
        <li>
          <strong>Access:</strong> Unlock gates, keep paths clear, and keep pets away from the garden while we work.
        </li>
        <li>
          <strong>Clear the garden:</strong> Move furniture, toys, tools, and branches off the lawn and beds we maintain.
        </li>
        <li>
          <strong>Pet waste:</strong> Pick it up in maintained areas before we arrive.
        </li>
        <li>
          <strong>Water:</strong> A working outdoor tap. We bring a hose or watering can. No tap? Tell us before signup
          - we may skip watering that visit.
        </li>
        <li>
          <strong>Power:</strong> A socket we can plug into from the garden - inside or outside your home is fine. Your
          gardener brings an extension lead of at least 20 metres.
        </li>
        <li>
          <strong>Grass clippings:</strong> You bin them, or leave your council garden-waste bin out on collection day. We
          do not usually take waste away.
        </li>
        <li>
          <strong>Your details:</strong> Keep your address, garden size, and access notes up to date in your account.
        </li>
      </ul>
      <p>
        If we cannot access your property, work safely, or complete maintenance because these conditions are not met, the
        visit may be marked incomplete and we are not obliged to refund that visit.
      </p>

      <h2>7. Visits, seasonality, and rescheduling</h2>
      <p>
        You can view upcoming visits in your account and request rescheduling through support where reasonable notice
        is given. Severe weather or operational issues may require us to reschedule visits.
      </p>
      <p>
        Garden maintenance is seasonal in the UK: we typically schedule <strong>more visits in spring and summer</strong>{" "}
        and <strong>fewer in autumn and winter</strong>, including core maintenance and signup add-on sessions. This keeps your garden cared for when it grows fastest and avoids unnecessary
        winter call-outs.
      </p>

      <h2>8. Cancellation, visit equalisation, and changes</h2>
      <p>
        You may request cancellation by contacting customer support through your account chat. Cancellation is not
        available as a self-service button in the billing portal during your minimum term.
      </p>
      <p>
        If you cancel, service continues until the end of your minimum term or current billing period (whichever applies
        to your plan), and you remain liable for charges due up to that date. We do not generally offer refunds for
        partial periods already billed, except where required by law or at our discretion in exceptional circumstances.
      </p>
      <p>
        <strong>Visit equalisation if you cancel early.</strong> Your subscription fee covers a set number of maintenance
        and add-on sessions over the year, spread across the seasons as described above. If you cancel before you have
        received the visits you have paid for, including add-on sessions still due on the annual schedule, we may{" "}
        <strong>reduce the number of remaining visits</strong> in the notice period after cancellation so that, overall,
        you receive approximately the visits and add-on work you have paid for - no more and no less.
      </p>
      <p>
        <strong>Example:</strong> you subscribe in <strong>April</strong> with add-ons and cancel in <strong>June</strong>.
        Visits already completed in April–May count toward what you have used. Scheduled visits from{" "}
        <strong>June through September</strong>, or through the end of your minimum term if later, may be{" "}
        <strong>reduced or rescheduled</strong> so we do not deliver a full summer-heavy schedule after you have cancelled,
        while still honouring work you have already paid for. Add-on sessions due later in the year
        may be cancelled if you cancel before those sessions would have taken place.
      </p>
      <p>
        We will confirm any changes to your remaining visit schedule through your account or support. This policy does
        not reduce your obligation to pay charges due through the end of your minimum term.
      </p>

      <h2>9. Upgrades and plan changes</h2>
      <p>
        Where available in your account, you may switch billing interval, such as monthly to annual.
        Changes may be prorated through Stripe. Downgrades are handled by support and may take effect at the next
        eligible billing date.
      </p>

      <h2>10. Gardeners and off-platform work</h2>
      <p>
        Gardeners who perform visits are independent contractors approved to use our platform. GardensSorted coordinates
        scheduling, customer billing, and quality standards; the gardener performs the agreed maintenance at your
        property. Before approval, gardeners must provide valid photo ID, pass right-to-work verification in the UK, and
        pass a basic DBS check, and hold their own relevant insurance (such as public liability for gardening work).
        Approved gardeners bring their own tools every visit (mower, strimmer or edger, hose,
        rake, brush, and a 20 m+ extension lead). We do not supply equipment.
      </p>
      <p>
        To protect our service and the gardeners who rely on it, you agree that while you have an active subscription, and
        for <strong>twelve (12) months</strong> after your last visit arranged through GardensSorted, you will not engage,
        hire, or pay any gardener who was introduced to you through our service to perform garden maintenance or similar
        work at your property <strong>outside</strong> GardensSorted without our prior written consent. If you wish to
        continue with the same gardener independently, contact us first - we may agree a handover or continuation
        arrangement.
      </p>
      <p>
        Cancelling your subscription to avoid platform fees while continuing the same arranged visits off-platform is
        not permitted. Breach of this section may result in immediate suspension or termination, and you may remain
        liable for fees due under your minimum term. Nothing in this section prevents you from using other gardeners who
        were not introduced through GardensSorted.
      </p>

      <h2>11. Quality and complaints</h2>
      <p>
        If you are unhappy with a visit, contact us promptly through account support with details and photos where
        helpful. We will review fairly and may offer a return visit, credit, or other remedy where the work did not meet
        the agreed maintenance standard and the issue was reported in reasonable time. This does not limit your statutory
        consumer rights.
      </p>

      <h2>12. Acceptable use</h2>
      <p>
        You must not misuse the service, provide false information, harass staff or gardeners, or use the platform for
        unlawful purposes. We may suspend or terminate accounts that breach these terms.
      </p>

      <h2>13. Liability</h2>
      <p>
        Nothing in these terms limits our liability for death or personal injury caused by negligence, fraud, or any
        other liability that cannot be excluded under UK law.
      </p>
      <p>
        Subject to the above, our total liability to you for any claim relating to the service is limited to the fees
        you paid to us in the 12 months before the claim. We are not liable for indirect or consequential loss (such as
        loss of profit) except where such exclusion is not permitted by law.
      </p>

      <h2>14. Your consumer rights</h2>
      <p>
        Nothing in these terms affects your statutory rights as a consumer in the UK, including rights under the Consumer
        Rights Act 2015. For online contracts, you may have a 14-day right to cancel in some circumstances; if you ask
        us to start the service during the cancellation period, you may need to pay for work already done. Digital
        content and ongoing subscription rules can vary - contact us if you need advice on your specific situation.
      </p>

      <h2>15. Complaints and contact</h2>
      <p>
        Contact us through your account support chat or email{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>. We aim to respond within a
        reasonable time.
      </p>

      <h2>16. Website, cookies, and privacy</h2>
      <p>
        Use of our website is also governed by our <Link href="/privacy">privacy policy</Link> and{" "}
        <Link href="/cookies">cookie policy</Link>. Non-essential cookies (such as advertising pixels) are only used with
        your consent.
      </p>

      <h2>17. Changes to these terms</h2>
      <p>
        We may update these terms. Material changes will be communicated by email or notice in your account. Continued
        use of the service after changes take effect constitutes acceptance where permitted by law.
      </p>

      <h2>18. Governing law</h2>
      <p>
        These terms are governed by the laws of England and Wales. Disputes are subject to the exclusive jurisdiction of
        the courts of England and Wales, without prejudice to your statutory rights as a consumer.
      </p>
    </LegalDocument>
  );
}
