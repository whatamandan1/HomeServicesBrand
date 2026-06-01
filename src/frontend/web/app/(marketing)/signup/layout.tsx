import type { Metadata } from "next";
import { VISIT_CADENCE_HEADLINE } from "@/lib/marketing-copy";
import { canonicalPath } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Get your garden care quote",
  description:
    "Get a personalised quote for regular garden maintenance in Yorkshire. Choose your garden size, see your monthly price, and subscribe online with vetted local gardeners.",
  alternates: { canonical: canonicalPath("/signup") },
  openGraph: {
    title: "Get your garden care quote | GardensSorted",
    description:
      `Personalised garden care pricing for Leeds, York, Wakefield and surrounding areas. ${VISIT_CADENCE_HEADLINE.toLowerCase()}.`,
    url: canonicalPath("/signup"),
  },
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
