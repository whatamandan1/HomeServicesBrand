import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://home-services-brand.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/about", "/multi-property-solutions", "/providers", "/signup", "/login", "/privacy", "/terms"];
  return routes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/signup" ? 0.9 : 0.7,
  }));
}
