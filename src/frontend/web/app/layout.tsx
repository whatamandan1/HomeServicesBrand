import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: {
    default: "GardensSorted — Garden care, sorted.",
    template: "%s | GardensSorted",
  },
  description:
    "Recurring garden care subscriptions for Yorkshire homes. Subscribe online, we schedule visits, local gardeners do the work.",
  openGraph: {
    title: "GardensSorted — Garden care, sorted.",
    description: "Recurring garden care subscriptions for Yorkshire homes.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
