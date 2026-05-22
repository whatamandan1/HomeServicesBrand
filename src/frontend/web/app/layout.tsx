import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gardenssorted.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "GardensSorted — Garden care, sorted.",
    template: "%s | GardensSorted",
  },
  description:
    "Recurring garden care subscriptions for Yorkshire homes. Subscribe online, we schedule visits, local gardeners do the work.",
  icons: {
    icon: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: "GardensSorted — Garden care, sorted.",
    description: "Recurring garden care subscriptions for Yorkshire homes.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "GardensSorted — Garden care, sorted." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GardensSorted — Garden care, sorted.",
    description: "Recurring garden care subscriptions for Yorkshire homes.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
