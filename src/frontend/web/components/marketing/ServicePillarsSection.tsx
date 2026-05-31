import { CalendarCheck, MapPin, MonitorSmartphone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const pillars: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: CalendarCheck,
    title: "Scheduled",
    description: "Regular visits through the season",
  },
  {
    icon: MapPin,
    title: "Local",
    description: "Approved gardeners in your area",
  },
  {
    icon: MonitorSmartphone,
    title: "Online",
    description: "Manage visits in your account",
  },
];

export function ServicePillarsSection() {
  return (
    <section
      className="border-b border-gardens-primary/10 bg-gradient-to-b from-white via-gardens-light/25 to-gardens-light/50 py-14 md:py-16"
      aria-labelledby="service-pillars-heading"
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-gardens-primary">
            Why it works
          </p>
          <h2
            id="service-pillars-heading"
            className="mt-2 font-display text-2xl font-semibold text-gardens-dark sm:text-3xl text-balance"
          >
            Scheduled. Local. Online.
          </h2>
          <p className="mt-3 text-sm text-stone-600 sm:text-base">
            The bits that matter most - without the hassle of juggling it yourself.
          </p>
        </div>

        <ul className="mt-10 grid gap-5 sm:grid-cols-3 sm:gap-6">
          {pillars.map(({ icon: Icon, title, description }) => (
            <li
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-gardens-primary/15 bg-white/90 p-6 shadow-soft backdrop-blur-sm transition hover:border-gardens-primary/30 hover:shadow-md md:p-7 md:text-center"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gardens-primary/[0.06] transition group-hover:bg-gardens-primary/10"
                aria-hidden
              />
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gardens-light text-gardens-primary ring-1 ring-gardens-primary/15 md:mx-auto">
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="relative mt-4 font-display text-2xl font-bold tracking-tight text-gardens-dark">
                {title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-stone-600">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
