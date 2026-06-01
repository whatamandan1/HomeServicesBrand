import { Quote, Star } from "lucide-react";
import { CUSTOMER_TESTIMONIALS } from "@/lib/seo/testimonials";

export function SocialProofSection() {
  return (
    <section className="border-y border-gardens-primary/10 bg-gardens-light/30 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">Why homeowners choose us</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-gardens-dark md:text-4xl text-balance">
            Less stress, more time enjoying your garden
          </h2>
          <p className="mt-4 text-stone-600 leading-relaxed">
            GardensSorted is built for people who want reliable garden maintenance - without becoming a part-time
            project manager.
          </p>
          <p className="mt-3 text-xs text-stone-500">Feedback from early Yorkshire customers (not Google reviews)</p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {CUSTOMER_TESTIMONIALS.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-gardens-primary/10 bg-white/80 p-6 md:p-8"
            >
              <div className="flex gap-1 text-gardens-primary" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <Quote className="mt-4 h-7 w-7 text-gardens-accent/80" aria-hidden />
              <p className="mt-3 text-stone-700 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <footer className="mt-4 text-sm font-medium text-stone-600">
                {t.name} · {t.area}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
