import { GARDEN_SIZE_GUIDE, GARDEN_SIZE_ORDER } from "@/lib/consumer-plans";
import { formatGbp } from "@/lib/format";
import type { FaqItem } from "@/lib/seo/home-faqs";
import { BUSINESS_DESCRIPTION, BUSINESS_NAME, canonicalPath } from "@/lib/seo/site";
import type { AreaPageCopy } from "@/lib/seo/area-pages";

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_NAME,
    url: canonicalPath("/"),
    logo: canonicalPath("/logo-icon.svg"),
    description: BUSINESS_DESCRIPTION,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Yorkshire, England",
    },
  };
}

export function webSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS_NAME,
    url: canonicalPath("/"),
  };
}

export function faqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function localServiceJsonLd(copy: AreaPageCopy) {
  const lowPrice = GARDEN_SIZE_GUIDE.Small.monthlyPrice;
  const highPrice = GARDEN_SIZE_GUIDE.Large.monthlyPrice;
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    url: canonicalPath(`/areas/${copy.slug}`),
    description: copy.metaDescription,
    areaServed: {
      "@type": "City",
      name: copy.hub.label,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Yorkshire, England",
      },
    },
    priceRange: `£${formatGbp(lowPrice)} - £${formatGbp(highPrice)} per month`,
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Garden care subscription",
        description:
          "10 garden maintenance visits per year. Lawn, borders, and tidy. Priced by maintained garden size.",
        areaServed: copy.hub.areaLabel,
        provider: {
          "@type": "Organization",
          name: BUSINESS_NAME,
        },
      },
    },
  };
}

export function serviceCatalogJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Garden care subscription",
    provider: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      url: canonicalPath("/"),
    },
    areaServed: "Yorkshire, England",
    description: BUSINESS_DESCRIPTION,
    offers: GARDEN_SIZE_ORDER.map((size) => {
      const guide = GARDEN_SIZE_GUIDE[size];
      return {
        "@type": "Offer",
        name: `${guide.shortName} garden - monthly`,
        price: guide.monthlyPrice,
        priceCurrency: "GBP",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: guide.monthlyPrice,
          priceCurrency: "GBP",
          unitText: "month",
        },
        description: `${guide.label} maintained · 10 visits per year`,
      };
    }),
  };
}
