import type { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://home-services-brand.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/portal/", "/provider/", "/admin/", "/landlord/"] },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
