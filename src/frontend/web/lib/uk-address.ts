import { normalizeUkPostcode } from "@/lib/signup-utils";

export type UkAddressFields = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
};

export type UkAddressSuggestion = {
  id: string;
  address: string;
};

export function formatUkAddressOneLine(fields: UkAddressFields): string {
  const parts = [
    fields.line1.trim(),
    fields.line2.trim(),
    fields.city.trim(),
    normalizeUkPostcode(fields.postcode),
  ].filter(Boolean);
  return parts.join(", ");
}

/** Map getAddress.io GET response to signup form fields. */
export function parseGetAddressPayload(data: Record<string, unknown>): UkAddressFields | null {
  const postcode = typeof data.postcode === "string" ? data.postcode : "";
  const town = typeof data.town_or_city === "string" ? data.town_or_city : "";
  const line1 = typeof data.line_1 === "string" ? data.line_1 : "";
  const line2 = typeof data.line_2 === "string" ? data.line_2 : "";
  const line3 = typeof data.line_3 === "string" ? data.line_3 : "";

  let resolvedLine1 = line1.trim();
  let resolvedCity = town.trim();

  if (!resolvedLine1 && Array.isArray(data.formatted_address)) {
    const formatted = data.formatted_address.filter((x) => typeof x === "string" && x.trim()) as string[];
    if (formatted.length > 0) resolvedLine1 = formatted[0].trim();
    if (!resolvedCity && formatted.length >= 2) {
      resolvedCity = formatted[formatted.length - 2]?.trim() || formatted[formatted.length - 1]?.trim() || "";
    }
  }

  if (!resolvedLine1 || !postcode.trim()) return null;

  const extraLine = [line2, line3].map((s) => s.trim()).filter(Boolean).join(", ");

  return {
    line1: resolvedLine1,
    line2: extraLine,
    city: resolvedCity || (typeof data.county === "string" ? data.county : ""),
    postcode: normalizeUkPostcode(postcode),
  };
}
