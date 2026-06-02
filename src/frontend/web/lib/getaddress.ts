import type { UkAddressSuggestion } from "@/lib/uk-address";

type GetAddressSuggestion = {
  id?: string;
  address?: string;
};

export function getAddressConfigured(): boolean {
  return Boolean(process.env.GETADDRESS_API_KEY?.trim());
}

export async function getAddressAutocomplete(
  query: string,
  apiKey: string
): Promise<{ suggestions: UkAddressSuggestion[]; error?: string }> {
  const res = await fetch(
    `https://api.getAddress.io/autocomplete/${encodeURIComponent(query)}?api-key=${encodeURIComponent(apiKey)}&all=true&top=6`,
    { next: { revalidate: 0 } }
  );

  if (res.status === 429) {
    return { suggestions: [], error: "Address lookup is busy. Try again in a moment." };
  }

  if (!res.ok) {
    const message = await readGetAddressErrorMessage(res);
    return {
      suggestions: [],
      error:
        message ??
        (res.status === 401 || res.status === 403
          ? "Address lookup is misconfigured. Update the getAddress.io API key."
          : "Address lookup failed."),
    };
  }

  const data = (await res.json()) as { suggestions?: GetAddressSuggestion[] };
  const suggestions = (data.suggestions ?? [])
    .filter((s): s is { id: string; address: string } => Boolean(s.id && s.address))
    .map((s) => ({ id: s.id, address: s.address }));

  return { suggestions };
}

async function readGetAddressErrorMessage(res: Response): Promise<string | null> {
  try {
    const data = (await res.json()) as { Message?: string; message?: string };
    return data.Message ?? data.message ?? null;
  } catch {
    return null;
  }
}
