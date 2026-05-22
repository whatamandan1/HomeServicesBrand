import Image from "next/image";

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/20">
        <Image
          src="/hero-garden.jpg"
          alt="Well-maintained Yorkshire garden with green lawn and flower borders"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 512px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gardens-dark/50 via-transparent to-transparent" />
      </div>

      <div className="absolute -bottom-6 -left-4 w-[88%] rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur md:-left-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">Your portal</p>
        <p className="mt-1 font-display text-lg font-semibold text-gardens-dark">Monthly Garden Care</p>
        <p className="text-sm text-stone-500">Active · Weekday mornings</p>
        <div className="mt-4 space-y-2">
          {[
            { date: "Thu 12 Jun", status: "Confirmed", gardener: "Sarah M." },
            { date: "Thu 26 Jun", status: "Scheduled", gardener: "Assigning…" },
          ].map((v) => (
            <div key={v.date} className="flex items-center justify-between rounded-xl bg-gardens-light/60 px-3 py-2.5">
              <div>
                <p className="text-sm font-medium text-gardens-dark">{v.date}</p>
                <p className="text-xs text-stone-500">{v.gardener}</p>
              </div>
              <span className="rounded-full bg-gardens-primary/10 px-2.5 py-0.5 text-xs font-medium text-gardens-primary">
                {v.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
