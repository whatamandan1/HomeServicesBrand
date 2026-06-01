import { SERVICE_HUBS, type ServiceHub } from "@/lib/marketing-location";

/** City slugs with dedicated SEO landing pages (month-1 pilot hubs). */
export const AREA_CITY_SLUGS = ["leeds", "york", "wakefield"] as const;

export type AreaCitySlug = (typeof AREA_CITY_SLUGS)[number];

export function isAreaCitySlug(slug: string): slug is AreaCitySlug {
  return (AREA_CITY_SLUGS as readonly string[]).includes(slug);
}

export function hubForSlug(slug: AreaCitySlug): ServiceHub {
  const hub = SERVICE_HUBS.find((h) => h.id === slug);
  if (!hub) throw new Error(`Missing hub for ${slug}`);
  return hub;
}

export type AreaPageCopy = {
  slug: AreaCitySlug;
  hub: ServiceHub;
  /** SEO title segment (before template suffix). */
  metaTitle: string;
  metaDescription: string;
  h1: string;
  heroLead: string;
  localParagraph: string;
  keywords: string[];
};

function buildCopy(hub: ServiceHub): AreaPageCopy {
  const city = hub.label;
  return {
    slug: hub.id as AreaCitySlug,
    hub,
    metaTitle: `Garden maintenance ${city}`,
    metaDescription: `Regular garden maintenance in ${city} and ${hub.areaLabel}. 10 visits per year, vetted local gardeners, subscribe online. Get your personalised quote.`,
    h1: `Regular garden maintenance in ${city}`,
    heroLead: `Lawn, borders, and tidy on a schedule - vetted local gardeners in ${hub.areaLabel}, managed in your online account.`,
    localParagraph: `GardensSorted is built for Yorkshire homeowners who want dependable garden care without chasing quotes. We serve ${hub.areaLabel} and nearby postcodes - enter yours when you get your quote and we'll confirm we can reach you.`,
    keywords: [
      `garden maintenance ${city}`,
      `gardener ${city}`,
      `lawn mowing ${city}`,
      `garden care ${city}`,
    ],
  };
}

const AREA_COPY: Record<AreaCitySlug, AreaPageCopy> = {
  leeds: buildCopy(hubForSlug("leeds")),
  york: buildCopy(hubForSlug("york")),
  wakefield: buildCopy(hubForSlug("wakefield")),
};

export function getAreaPageCopy(slug: AreaCitySlug): AreaPageCopy {
  return AREA_COPY[slug];
}

export function areaFaqs(copy: AreaPageCopy): { q: string; a: string }[] {
  const { hub } = copy;
  return [
    {
      q: `Do you cover my postcode in ${hub.label}?`,
      a: `We are rolling out across ${hub.areaLabel} and nearby areas. Enter your postcode on our quote form - if we cannot serve you yet, we will tell you before you pay.`,
    },
    {
      q: "How often do you visit?",
      a: "Garden care includes 10 visits per year - roughly every 5–6 weeks. Each visit covers lawn mowing and edging, weeding, and a general tidy of the areas we maintain.",
    },
    {
      q: "How is pricing calculated?",
      a: "Monthly price depends on the size of lawn and beds we maintain (up to 150 m²) and any optional add-ons. You see your exact quote online before checkout.",
    },
    {
      q: "Is there a minimum term?",
      a: "Yes - garden care subscriptions include a minimum term (typically 3 months). Add-ons may have a longer minimum. This is shown clearly before you pay.",
    },
    {
      q: "How do I book and manage visits?",
      a: "Subscribe online, then use your GardensSorted account to see upcoming visits, reschedule, and message us. We assign vetted local gardeners to your property.",
    },
  ];
}
