import type { FaqItem } from "@/lib/seo/home-faqs";
import { VISIT_CADENCE_HEADLINE } from "@/lib/marketing-copy";
import { BUSINESS_DESCRIPTION, BUSINESS_NAME, canonicalPath } from "@/lib/seo/site";
import type { AreaPageCopy } from "@/lib/seo/area-pages";
import type { CustomerTestimonial } from "@/lib/seo/testimonials";

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
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Garden care subscription",
        description:
          `${VISIT_CADENCE_HEADLINE} for garden maintenance. Personalised quote by garden size after signup.`,
        areaServed: copy.hub.areaLabel,
        provider: {
          "@type": "Organization",
          name: BUSINESS_NAME,
        },
      },
    },
  };
}

/** Homepage testimonials — genuine early feedback; distinct from Google Business Profile reviews. */
export function customerTestimonialsJsonLd(testimonials: readonly CustomerTestimonial[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BUSINESS_NAME,
    url: canonicalPath("/"),
    review: testimonials.map((t) => ({
      "@type": "Review",
      reviewBody: t.quote,
      author: { "@type": "Person", name: t.name },
      reviewRating: {
        "@type": "Rating",
        ratingValue: 5,
        bestRating: 5,
      },
      contentLocation: {
        "@type": "Place",
        name: `${t.area}, Yorkshire`,
      },
    })),
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
    description:
      `Regular garden maintenance with ${VISIT_CADENCE_HEADLINE.toLowerCase()}. Personalised monthly quote by garden size - provided during online signup.`,
  };
}
