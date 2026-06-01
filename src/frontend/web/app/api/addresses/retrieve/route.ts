import { NextResponse } from "next/server";
import { parseGetAddressPayload } from "@/lib/uk-address";

export async function GET(request: Request) {
  const apiKey = process.env.GETADDRESS_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: "Address lookup is not configured." }, { status: 503 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing address id." }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.getAddress.io/get/${encodeURIComponent(id)}?api-key=${encodeURIComponent(apiKey)}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Could not load that address." }, { status: res.status === 404 ? 404 : 502 });
    }

    const data = (await res.json()) as Record<string, unknown>;
    const address = parseGetAddressPayload(data);
    if (!address) {
      return NextResponse.json({ error: "Could not parse that address." }, { status: 502 });
    }

    return NextResponse.json({ address });
  } catch {
    return NextResponse.json({ error: "Could not load that address." }, { status: 502 });
  }
}
