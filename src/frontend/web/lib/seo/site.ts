import { SITE_URL } from "@/lib/site-url";

export const BUSINESS_NAME = "GardensSorted";
export const BUSINESS_DESCRIPTION =
  "Recurring garden maintenance subscriptions for Yorkshire homes. Vetted local gardeners, 10 visits per year, manage visits online.";

export function canonicalPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
