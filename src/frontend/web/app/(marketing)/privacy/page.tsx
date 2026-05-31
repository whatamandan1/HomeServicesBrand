import type { Metadata } from "next";
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
      lastUpdated="23 May 2026"
    >
      <h2>Who we are</h2>
      <p>
        GardensSorted provides subscription garden care services in Yorkshire. For data protection queries, contact{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> - name, email address, phone number, and login credentials (passwords are
          stored hashed, never in plain text).
        </li>
        <li>
          <strong>Property information</strong> - address, postcode, garden size, access notes, and visit preferences.
        </li>
        <li>
          <strong>Subscription and billing</strong> - plan choice, visit history, and payment status. Card details are
          processed by Stripe; we do not store full card numbers on our servers.
        </li>
        <li>
          <strong>Communications</strong> - support chat messages, emails, and SMS where you have opted in or we need
          to notify you about a visit.
        </li>
        <li>
          <strong>Technical data</strong> - basic logs from our website and API (IP address, browser type, pages viewed)
          to keep the service secure and reliable.
        </li>
      </ul>

      <h2>How we use your information</h2>
      <p>We use personal data to:</p>
      <ul>
        <li>Provide and manage your subscription and scheduled garden visits</li>
        <li>Match you with approved local gardeners and coordinate dispatch</li>
        <li>Process payments and send billing-related communications</li>
        <li>Respond to support requests and resolve escalations</li>
        <li>Improve our service and prevent fraud or misuse</li>
        <li>Comply with legal and accounting obligations</li>
      </ul>

      <h2>Legal basis (UK GDPR)</h2>
      <p>We process personal data where:</p>
      <ul>
        <li>It is necessary to perform our contract with you (providing the subscription service)</li>
        <li>We have a legitimate interest (e.g. service improvement, security) that is not overridden by your rights</li>
        <li>You have given consent (e.g. optional marketing, where applicable)</li>
        <li>We have a legal obligation to retain or disclose information</li>
      </ul>

      <h2>Who we share data with</h2>
      <p>We use trusted processors to run the platform, including:</p>
      <ul>
        <li>
          <strong>Stripe</strong> - payment processing and customer billing portal
        </li>
        <li>
          <strong>SendGrid</strong> - transactional email
        </li>
        <li>
          <strong>Hosting providers</strong> - Vercel (website) and Railway (API/database)
        </li>
        <li>
          <strong>Approved gardeners</strong> - only the information needed to complete a visit (address, access notes,
          schedule)
        </li>
      </ul>
      <p>We do not sell your personal data.</p>

      <h2>Cookies and local storage</h2>
      <p>
        When you log in, we store a session token in your browser (local storage) and set short-lived cookies so our
        website can keep you signed in and route you to the correct portal. These are essential for the service to work.
      </p>

      <h2>How long we keep data</h2>
      <p>
        We retain account and subscription records while you are a customer and for a reasonable period afterwards for
        support, disputes, and legal requirements. You can ask us to delete data where we are not required to keep it.
      </p>

      <h2>Your rights</h2>
      <p>Under UK data protection law you can request:</p>
      <ul>
        <li>Access to the personal data we hold about you</li>
        <li>Correction of inaccurate data</li>
        <li>Erasure in certain circumstances</li>
        <li>Restriction or objection to processing in certain circumstances</li>
        <li>Data portability where applicable</li>
      </ul>
      <p>
        To exercise these rights, email{" "}
        <a href="mailto:hello@gardenssorted.co.uk">hello@gardenssorted.co.uk</a>. You may also complain to the ICO (
        <a href="https://ico.org.uk" rel="noopener noreferrer" target="_blank">
          ico.org.uk
        </a>
        ).
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy from time to time. The &quot;Last updated&quot; date at the top of this page will
        change when we do.
      </p>
    </LegalDocument>
  );
}
