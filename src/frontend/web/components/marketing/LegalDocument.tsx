import Link from "next/link";
import type { ReactNode } from "react";

export function LegalDocument({
  title,
  description,
  lastUpdated,
  children,
}: {
  title: string;
  description: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="bg-gradient-to-b from-gardens-light/50 to-stone-50 py-16">
        <div className="mx-auto max-w-3xl px-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-gardens-dark md:text-5xl">{title}</h1>
          <p className="mt-4 text-lg text-stone-600">{description}</p>
          <p className="mt-2 text-sm text-stone-500">Last updated: {lastUpdated}</p>
        </div>
      </section>

      <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 text-stone-700 [&_a]:font-medium [&_a]:text-gardens-primary [&_a]:hover:underline [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-gardens-dark [&_li]:leading-relaxed [&_p]:leading-relaxed [&_strong]:text-stone-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </article>

      <section className="border-t border-stone-200 py-10 text-center">
        <p className="text-sm text-stone-600">
          Questions? Email{" "}
          <a href="mailto:hello@gardenssorted.co.uk" className="font-medium text-gardens-primary hover:underline">
            hello@gardenssorted.co.uk
          </a>
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-medium text-gardens-primary hover:underline">
          ← Back to homepage
        </Link>
      </section>
    </>
  );
}
