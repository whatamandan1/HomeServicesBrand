import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";
import { AREA_CITY_SLUGS } from "@/lib/seo/area-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/about",
    "/multi-property-solutions",
    "/providers",
    "/signup",
    ...AREA_CITY_SLUGS.map((city) => `/areas/${city}`),
    "/login",
    "/privacy",
    "/cookies",
    "/terms",
  ];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path.startsWith("/areas/") ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/signup" ? 0.9 : path.startsWith("/areas/") ? 0.85 : 0.7,
  }));
}
