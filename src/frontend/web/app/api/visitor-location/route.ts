import { NextResponse } from "next/server";

/** Edge/Vercel/Cloudflare geo headers - no precise location stored server-side. */
export async function GET(request: Request) {
  const lat = parseGeoHeader(request, [
    "x-vercel-ip-latitude",
    "cf-iplatitude",
  ]);
  const lon = parseGeoHeader(request, [
    "x-vercel-ip-longitude",
    "cf-iplongitude",
  ]);
  const city = pickHeader(request, ["x-vercel-ip-city", "cf-ipcity"]);
  const country = pickHeader(request, ["x-vercel-ip-country", "cf-ipcountry"]);

  if (lat == null || lon == null) {
    return NextResponse.json({ coords: null });
  }

  return NextResponse.json({
    coords: {
      lat,
      lon,
      source: "edge" as const,
      city,
      country,
    },
  });
}

function pickHeader(request: Request, names: string[]) {
  for (const name of names) {
    const value = request.headers.get(name)?.trim();
    if (value) return value;
  }
  return null;
}

function parseGeoHeader(request: Request, names: string[]) {
  const raw = pickHeader(request, names);
  if (!raw) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}
