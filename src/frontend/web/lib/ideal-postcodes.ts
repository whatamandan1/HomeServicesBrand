import type { UkAddressFields, UkAddressSuggestion } from "@/lib/uk-address";
import { normalizeUkPostcode } from "@/lib/signup-utils";

const BASE = "https://api.ideal-postcodes.co.uk/v1";

type IdealHit = {
  id?: string;
  suggestion?: string;
  udprn?: number;
};

type IdealAddress = {
  line_1?: string;
  line_2?: string;
  line_3?: string;
  post_town?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
};

export function idealPostcodesConfigured(): boolean {
  return Boolean(process.env.IDEAL_POSTCODES_API_KEY?.trim());
}

export async function idealPostcodesAutocomplete(
  query: string,
  apiKey: string
): Promise<{ suggestions: UkAddressSuggestion[]; error?: string }> {
  const url = `${BASE}/autocomplete/addresses?q=${encodeURIComponent(query)}&api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (res.status === 429) {
    return { suggestions: [], error: "Address lookup is busy. Try again in a moment." };
  }

  if (!res.ok) {
    const message = await readIdealErrorMessage(res);
    return {
      suggestions: [],
      error: message ?? "Address lookup failed. Check your Ideal Postcodes API key.",
    };
  }

  const data = (await res.json()) as { result?: { hits?: IdealHit[] } };
  const suggestions = (data.result?.hits ?? [])
    .filter((hit): hit is IdealHit & { udprn: number; suggestion: string } =>
      Boolean(hit.udprn && hit.suggestion)
    )
    .map((hit) => ({
      id: String(hit.udprn),
      address: hit.suggestion,
    }));

  return { suggestions };
}

export async function idealPostcodesRetrieve(
  udprn: string,
  apiKey: string
): Promise<{ address?: UkAddressFields; error?: string }> {
  const url = `${BASE}/udprn/${encodeURIComponent(udprn)}?api_key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, { next: { revalidate: 0 } });

  if (!res.ok) {
    const message = await readIdealErrorMessage(res);
    return {
      error: message ?? (res.status === 404 ? "Address not found." : "Could not load that address."),
    };
  }

  const data = (await res.json()) as { result?: IdealAddress };
  const address = parseIdealPostcodesPayload(data.result ?? {});
  if (!address) {
    return { error: "Could not parse that address." };
  }

  return { address };
}

export function parseIdealPostcodesPayload(data: IdealAddress): UkAddressFields | null {
  const line1 = data.line_1?.trim() ?? "";
  const postcode = data.postcode?.trim() ?? "";
  if (!line1 || !postcode) return null;

  const extraLine = [data.line_2, data.line_3]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");

  return {
    line1,
    line2: extraLine,
    city: data.post_town?.trim() ?? "",
    postcode: normalizeUkPostcode(postcode),
    latitude: typeof data.latitude === "number" ? data.latitude : undefined,
    longitude: typeof data.longitude === "number" ? data.longitude : undefined,
  };
}

async function readIdealErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { message?: string; error?: string };
    return data.message ?? data.error ?? null;
  } catch {
    return null;
  }
}
