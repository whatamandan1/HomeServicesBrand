import type { Metadata } from "next";
import Link from "next/link";
import { LegalDocument } from "@/components/marketing/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How GardensSorted collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy policy"
      description="How we handle your personal information when you use GardensSorted."
      lastUpdated="30 May 2026"
    >
      <h2>1. Who we are</h2>
      <p>
        GardensSorted provides subscription garden care in Yorkshire through{" "}
        <Link href="/">gardenssorted.co.uk</Link>. We are the <strong>data controller</strong> for personal data
        collected through this website and your customer account.
      </p>
      <p>
        For data protection enquiries, email{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>. If you need our full registered
        company name and postal address (for example for legal correspondence), ask us by email and we will provide it.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Account and identity</strong> - name, email address, phone number (if provided), and login credentials
          (passwords are stored hashed, never in plain text).
        </li>
        <li>
          <strong>Property and service</strong> - address, postcode, garden size band, access notes, visit preferences,
          plan and add-ons selected, visit history, and optional garden photos you upload.
        </li>
        <li>
          <strong>Subscription and billing</strong> - plan, pricing, minimum term, payment status, and Stripe customer
          identifiers. Card details are entered on Stripe&apos;s secure pages; we do not store full card numbers on our
          servers.
        </li>
        <li>
          <strong>Signup and quotes</strong> - if you enter your email in the quote flow before completing payment, we
          may save your progress (name, email, garden size, step reached) so we can follow up or help you finish signup.
        </li>
        <li>
          <strong>Communications</strong> - support chat messages, emails, and SMS about visits or your account where
          permitted (see marketing below).
        </li>
        <li>
          <strong>Technical and security data</strong> - IP address, browser type, device information, and logs from our
          website and API to keep the service secure and diagnose faults.
        </li>
        <li>
          <strong>Website usage (with consent)</strong> - if you accept non-essential cookies, analytics and advertising
          partners may collect online identifiers and interaction data as described in our{" "}
          <Link href="/cookies">cookie policy</Link>.
        </li>
      </ul>

      <h2>3. How we use your information</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>Provide and manage your subscription and scheduled garden visits</li>
        <li>Match you with approved local gardeners and share visit details with them</li>
        <li>Process payments, invoices, and billing-related communications</li>
        <li>Respond to support requests, complaints, and safety issues</li>
        <li>Send transactional messages (visit confirmations, reminders, service updates)</li>
        <li>Improve our service, measure marketing performance, and prevent fraud or misuse</li>
        <li>Comply with legal, tax, and accounting obligations</li>
      </ul>

      <h2>4. Legal basis (UK GDPR)</h2>
      <p>We process personal data where one or more of the following applies:</p>
      <ul>
        <li>
          <strong>Contract</strong> - processing is necessary to perform our agreement with you (running your
          subscription and visits).
        </li>
        <li>
          <strong>Legitimate interests</strong> - for example service improvement, security, recovering debts, and
          enforcing our terms, where your rights do not override those interests.
        </li>
        <li>
          <strong>Consent</strong> - for optional marketing emails, non-essential cookies (Meta Pixel, analytics), and
          similar choices where we ask for your permission. You can withdraw consent at any time.
        </li>
        <li>
          <strong>Legal obligation</strong> - where we must retain or disclose information (for example tax records).
        </li>
      </ul>

      <h2>5. Marketing</h2>
      <p>
        We may send you service-related emails (quotes, account updates, visit information) as part of providing the
        service. Separate promotional emails are optional. If we offer a marketing opt-in at signup or elsewhere, we
        will only send promotional messages when you have agreed, and you can unsubscribe using the link in each email or
        by contacting us.
      </p>
      <p>
        Advertising cookies (such as Meta Pixel) are only used if you choose <strong>Accept all</strong> on our cookie
        banner. See the <Link href="/cookies">cookie policy</Link> to change your preference.
      </p>

      <h2>6. Who we share data with</h2>
      <p>We use trusted processors to run the platform. They process data on our instructions and only as needed:</p>
      <ul>
        <li>
          <strong>Stripe</strong> - payment processing and customer billing portal (may involve processing outside the
          UK).
        </li>
        <li>
          <strong>SendGrid</strong> - transactional and service email.
        </li>
        <li>
          <strong>Twilio</strong> - SMS visit notifications where enabled.
        </li>
        <li>
          <strong>Vercel</strong> - website hosting.
        </li>
        <li>
          <strong>Railway</strong> - API and database hosting.
        </li>
        <li>
          <strong>Meta (Facebook / Instagram)</strong> - advertising measurement and remarketing, only if you accept
          marketing cookies.
        </li>
        <li>
          <strong>Google</strong> - analytics, if enabled and you accept non-essential cookies.
        </li>
        <li>
          <strong>Approved gardeners</strong> - name, address, access notes, schedule, and photos needed to complete
          visits safely.
        </li>
      </ul>
      <p>We do not sell your personal data.</p>
      <p>
        We may disclose information if required by law, to protect our rights, or in connection with a business sale or
        restructuring (you would be notified where required).
      </p>

      <h2>7. International transfers</h2>
      <p>
        Some processors (including Stripe, Meta, Google, and cloud hosts) may store or process data outside the UK. Where
        data is transferred internationally, we rely on appropriate safeguards permitted under UK law (such as adequacy
        regulations, UK International Data Transfer agreements, or Standard Contractual Clauses). You can request more
        detail by contacting us.
      </p>

      <h2>8. Cookies and similar technologies</h2>
      <p>
        Essential cookies and local storage keep you signed in and remember your cookie choice. Optional analytics and
        marketing tools are described in our <Link href="/cookies">cookie policy</Link>, including Meta Pixel and Google
        Analytics.
      </p>

      <h2>9. How long we keep data</h2>
      <ul>
        <li>
          <strong>Active customers</strong> - for the life of your account and subscription.
        </li>
        <li>
          <strong>After you leave</strong> - account, billing, and visit records for a period needed for support,
          disputes, tax, and legal claims (typically several years unless a longer period is required by law).
        </li>
        <li>
          <strong>Signup leads</strong> - incomplete signups for a limited period so we can help you complete checkout,
          then deleted or anonymised unless you become a customer.
        </li>
        <li>
          <strong>Support and chat</strong> - for as long as needed to resolve issues and improve service.
        </li>
        <li>
          <strong>Marketing consent records</strong> - for as long as needed to demonstrate compliance.
        </li>
      </ul>
      <p>You can ask us to delete data where we are not legally required to keep it.</p>

      <h2>10. Your rights</h2>
      <p>Under UK data protection law you can request:</p>
      <ul>
        <li>Access to the personal data we hold about you</li>
        <li>Correction of inaccurate data</li>
        <li>Erasure in certain circumstances</li>
        <li>Restriction or objection to processing in certain circumstances</li>
        <li>Data portability where applicable</li>
        <li>Withdrawal of consent (for example marketing or non-essential cookies) without affecting lawfulness before
          withdrawal
        </li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>. We respond within one month in most
        cases (this may be extended for complex requests).
      </p>
      <p>
        You may complain to the Information Commissioner&apos;s Office (ICO):{" "}
        <a href="https://ico.org.uk" rel="noopener noreferrer" target="_blank">
          ico.org.uk
        </a>
        .
      </p>

      <h2>11. Children</h2>
      <p>
        Our service is aimed at adults contracting for household garden care. We do not knowingly collect personal data
        from children under 16. Contact us if you believe we have done so and we will delete it.
      </p>

      <h2>12. Automated decisions</h2>
      <p>
        We do not make decisions about you based solely on automated processing that have legal or similarly significant
        effects. Visit scheduling and gardener matching involve human oversight and operational rules.
      </p>

      <h2>13. Security</h2>
      <p>
        We use technical and organisational measures appropriate to the data we hold (access controls, encryption in
        transit, hashed passwords, and processor security standards). No online service is completely secure; please use
        a strong unique password and keep your login details private.
      </p>

      <h2>14. Changes</h2>
      <p>
        We may update this policy from time to time. Material changes will be highlighted on this page (the &quot;Last
        updated&quot; date will change). Where required, we will notify you by email or in your account.
      </p>
    </LegalDocument>
  );
}
