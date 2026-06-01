import { SITE_URL } from "@/lib/site-url";
import { VISIT_CADENCE_HEADLINE } from "@/lib/marketing-copy";

export const BUSINESS_NAME = "GardensSorted";
export const BUSINESS_DESCRIPTION =
  `Recurring garden maintenance subscriptions for Yorkshire homes. Vetted local gardeners, ${VISIT_CADENCE_HEADLINE.toLowerCase()}, manage visits online.`;

export function canonicalPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
