import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "I wanted someone dependable without the back-and-forth every few weeks. Having visits booked in advance makes life much easier.",
    name: "Sarah M.",
    area: "Leeds",
  },
  {
    quote:
      "Being able to see who's coming and reschedule online is a big deal for us. It feels properly organised, not like a favour from a mate.",
    name: "James & Priya",
    area: "York",
  },
];

export function SocialProofSection() {
  return (
    <section className="border-y border-gardens-primary/10 bg-white py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">Why homeowners choose us</p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-gardens-dark md:text-4xl text-balance">
            Less stress, more time enjoying your garden
          </h2>
          <p className="mt-4 text-stone-600 leading-relaxed">
            GardensSorted is built for people who want their outdoor space maintained properly — without becoming a part-time project manager.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {testimonials.map((t) => (
            <blockquote
              key={t.name}
              className="rounded-2xl border border-stone-200 bg-stone-50 p-6 md:p-8"
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
