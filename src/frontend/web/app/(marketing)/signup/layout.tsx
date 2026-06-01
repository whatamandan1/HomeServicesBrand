import type { Metadata } from "next";
import { canonicalPath } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Get your garden care quote",
  description:
    "Get a personalised quote for regular garden maintenance in Yorkshire. Choose your garden size, see your monthly price, and subscribe online with vetted local gardeners.",
  alternates: { canonical: canonicalPath("/signup") },
  openGraph: {
    title: "Get your garden care quote | GardensSorted",
    description:
      "Personalised garden care pricing for Leeds, York, Wakefield and surrounding areas. 10 visits per year.",
    url: canonicalPath("/signup"),
  },
  robots: { index: true, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
