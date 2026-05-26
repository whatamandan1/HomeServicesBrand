import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/multi-property-solutions", "/providers", "/signup", "/login", "/privacy", "/terms"];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/signup" ? 0.9 : 0.7,
  }));
}
