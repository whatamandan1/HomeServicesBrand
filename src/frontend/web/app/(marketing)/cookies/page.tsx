import type { Metadata } from "next";
import Link from "next/link";
import { CookiePreferences } from "@/components/marketing/CookiePreferences";
import { LegalDocument } from "@/components/marketing/LegalDocument";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How GardensSorted uses cookies and similar technologies on gardenssorted.co.uk.",
};

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie policy"
      description="How we use cookies and similar technologies, and how you can control them."
      lastUpdated="30 May 2026"
    >
      <h2>1. What this policy covers</h2>
      <p>
        This policy explains how GardensSorted uses cookies and similar technologies (such as local storage and pixels)
        when you visit <Link href="/">gardenssorted.co.uk</Link>. It should be read with our{" "}
        <Link href="/privacy">privacy policy</Link>.
      </p>
      <p>
        Under UK law (PECR and UK GDPR), we must tell you what cookies we use and, for non-essential cookies, obtain
        your consent before they are set or read, except where an exemption applies.
      </p>

      <h2>2. How to control cookies</h2>
      <p>
        When you first visit our marketing site, you can choose <strong>Accept all</strong> or{" "}
        <strong>Essential only</strong>. You can change your choice at any time:
      </p>
      <CookiePreferences />
      <p className="text-sm text-stone-600">
        You can also block cookies in your browser settings. Blocking essential cookies may prevent you from staying
        logged in to your account.
      </p>

      <h2>3. Categories we use</h2>
      <h3 className="font-display text-lg font-semibold text-gardens-dark">Strictly necessary</h3>
      <p>
        These are required for security, sign-in, and basic site operation. We do not ask for consent for these because
        they are necessary to provide the service you request.
      </p>
      <ul>
        <li>
          <strong>Session cookies</strong> (<code>sorted_session</code>, <code>sorted_role</code>) - keep you logged in
          and route you to the correct portal. Short-lived, set when you log in.
        </li>
        <li>
          <strong>Local storage (auth)</strong> - stores your session token after login so the app can call our API
          securely.
        </li>
        <li>
          <strong>Cookie consent preference</strong> - remembers whether you accepted marketing/analytics cookies.
        </li>
        <li>
          <strong>Signup session</strong> - helps save incomplete signup progress (e.g. quote step) without creating a
          full account.
        </li>
      </ul>

      <h3 className="font-display text-lg font-semibold text-gardens-dark">Analytics and marketing (optional)</h3>
      <p>
        Only loaded if you choose <strong>Accept all</strong>. They help us understand how visitors use the site and
        whether our advertising is effective. They may collect identifiers such as IP address, browser type, pages
        viewed, and referral source.
      </p>
      <ul>
        <li>
          <strong>Meta Pixel (Facebook / Instagram)</strong> - conversion and remarketing measurement for ads we run on
          Meta platforms. Provider: Meta Platforms Ireland Ltd / Meta Platforms Inc. Privacy policy:{" "}
          <a href="https://www.facebook.com/privacy/policy/" rel="noopener noreferrer" target="_blank">
            facebook.com/privacy/policy
          </a>
          .
        </li>
        <li>
          <strong>Google Analytics 4</strong> - aggregated website usage statistics, if enabled on our site. Provider:
          Google. Privacy policy:{" "}
          <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">
            policies.google.com/privacy
          </a>
          . We configure IP anonymisation where the product allows it.
        </li>
      </ul>
      <p>
        We may add other marketing or analytics tools (for example Google Ads tags) in future. We will update this page
        before enabling them and will only load them if you have accepted non-essential cookies.
      </p>

      <h2>4. Cookie table (summary)</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-stone-800">
              <th className="py-2 pr-3 font-semibold">Name / tool</th>
              <th className="py-2 pr-3 font-semibold">Purpose</th>
              <th className="py-2 pr-3 font-semibold">Duration</th>
              <th className="py-2 font-semibold">Consent</th>
            </tr>
          </thead>
          <tbody className="text-stone-700">
            <tr className="border-b border-stone-100">
              <td className="py-2 pr-3">sorted_session, sorted_role</td>
              <td className="py-2 pr-3">Authentication</td>
              <td className="py-2 pr-3">Session / ~7 days</td>
              <td className="py-2">Not required (essential)</td>
            </tr>
            <tr className="border-b border-stone-100">
              <td className="py-2 pr-3">sorted_cookie_consent (local storage)</td>
              <td className="py-2 pr-3">Stores your cookie choice</td>
              <td className="py-2 pr-3">Until you clear site data</td>
              <td className="py-2">Not required (essential)</td>
            </tr>
            <tr className="border-b border-stone-100">
              <td className="py-2 pr-3">Meta Pixel (_fbp, etc.)</td>
              <td className="py-2 pr-3">Ad measurement and remarketing</td>
              <td className="py-2 pr-3">As set by Meta (often up to 90 days)</td>
              <td className="py-2">Required</td>
            </tr>
            <tr>
              <td className="py-2 pr-3">Google Analytics (_ga, etc.)</td>
              <td className="py-2 pr-3">Site analytics</td>
              <td className="py-2 pr-3">As set by Google (often up to 2 years)</td>
              <td className="py-2">Required</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>5. International transfers</h2>
      <p>
        Meta and Google may process data outside the UK. Where required, they rely on appropriate safeguards (such as UK
        extension to EU Standard Contractual Clauses or UK International Data Transfer agreements). See their privacy
        policies for details.
      </p>

      <h2>6. Changes</h2>
      <p>
        We may update this policy when we change tools or legal requirements. The &quot;Last updated&quot; date at the
        top will change when we do.
      </p>
    </LegalDocument>
  );
}
