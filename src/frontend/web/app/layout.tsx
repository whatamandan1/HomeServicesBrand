import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GardensSorted",
  description: "Recurring garden care subscriptions in Yorkshire",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-gardens-primary/20 bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <a href="/" className="text-xl font-semibold text-gardens-primary">
              GardensSorted
            </a>
            <nav className="flex gap-4 text-sm">
              <a href="/signup">Sign up</a>
              <a href="/login">Login</a>
              <a href="/portal">Customer</a>
              <a href="/provider">Provider</a>
              <a href="/admin">Admin</a>
              <a href="/login" className="text-stone-400" title="Use Login to switch accounts">
                Switch account
              </a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
