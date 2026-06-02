import { NextResponse } from "next/server";
import { addressLookupEnabled, resolveAddressLookupProvider } from "@/lib/address-lookup-config";
import { getAddressAutocomplete } from "@/lib/getaddress";
import { idealPostcodesAutocomplete } from "@/lib/ideal-postcodes";

export async function GET(request: Request) {
  if (!addressLookupEnabled()) {
    return NextResponse.json({ enabled: false, suggestions: [] });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ enabled: true, suggestions: [] });
  }

  const provider = resolveAddressLookupProvider();
  if (!provider) {
    return NextResponse.json({ enabled: false, suggestions: [] });
  }

  try {
    const result =
      provider === "ideal-postcodes"
        ? await idealPostcodesAutocomplete(q, process.env.IDEAL_POSTCODES_API_KEY!.trim())
        : await getAddressAutocomplete(q, process.env.GETADDRESS_API_KEY!.trim());

    return NextResponse.json({
      enabled: true,
      suggestions: result.suggestions,
      ...(result.error ? { error: result.error } : {}),
    });
  } catch {
    return NextResponse.json({
      enabled: true,
      suggestions: [],
      error: "Could not search addresses.",
    });
  }
}
