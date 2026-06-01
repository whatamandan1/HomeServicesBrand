import { NextResponse } from "next/server";

type GetAddressSuggestion = {
  id?: string;
  address?: string;
};

export async function GET(request: Request) {
  const apiKey = process.env.GETADDRESS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ enabled: false, suggestions: [] });
  }

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 3) {
    return NextResponse.json({ enabled: true, suggestions: [] });
  }

  try {
    const res = await fetch(
      `https://api.getAddress.io/autocomplete/${encodeURIComponent(q)}?api-key=${encodeURIComponent(apiKey)}&all=true&top=6`,
      { next: { revalidate: 0 } }
    );

    if (res.status === 429) {
      return NextResponse.json(
        { enabled: true, suggestions: [], error: "Address lookup is busy. Try again in a moment." },
        { status: 429 }
      );
    }

    if (!res.ok) {
      return NextResponse.json({ enabled: true, suggestions: [] });
    }

    const data = (await res.json()) as { suggestions?: GetAddressSuggestion[] };
    const suggestions = (data.suggestions ?? [])
      .filter((s): s is { id: string; address: string } => Boolean(s.id && s.address))
      .map((s) => ({ id: s.id, address: s.address }));

    return NextResponse.json({ enabled: true, suggestions });
  } catch {
    return NextResponse.json({ enabled: true, suggestions: [], error: "Could not search addresses." });
  }
}
