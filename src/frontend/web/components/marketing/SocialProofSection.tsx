import Image from "next/image";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Finally — garden care that just happens. No chasing, no quotes every time.",
    name: "Early customer",
    area: "Leeds",
  },
  {
    quote: "Love knowing who's coming and when. The portal makes everything clear.",
    name: "Beta homeowner",
    area: "York",
  },
];

export function SocialProofSection() {
  return (
    <section className="border-y border-gardens-primary/10 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft">
            <Image
              src="/hero-garden.jpg"
              alt="Green garden lawn and planting in Yorkshire"
              fill
              className="object-cover object-left"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gardens-primary/10" />
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">Trusted locally</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-gardens-dark md:text-4xl text-balance">
              Yorkshire homeowners want gardens that stay sorted
            </h2>
            <div className="mt-8 space-y-6">
              {testimonials.map((t) => (
                <blockquote key={t.name} className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
                  <Quote className="h-8 w-8 text-gardens-accent" aria-hidden />
                  <p className="mt-3 text-stone-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="mt-4 text-sm text-stone-500">
                    — {t.name}, {t.area}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
