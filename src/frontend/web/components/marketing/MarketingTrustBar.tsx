import { CreditCard, MapPin, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Vetted gardeners",
    body: "Approved local professionals assigned to your visits.",
  },
  {
    icon: CreditCard,
    title: "Secure checkout",
    body: "Subscribe online with Stripe - your personalised quote before you pay.",
  },
  {
    icon: MapPin,
    title: "Built for Yorkshire",
    body: "Serving Leeds, York, Wakefield and surrounding postcodes.",
  },
];

export function MarketingTrustBar() {
  return (
    <section className="border-y border-gardens-primary/10 bg-white py-8" aria-label="Why trust GardensSorted">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gardens-light text-gardens-primary">
              <item.icon className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-gardens-dark">{item.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
