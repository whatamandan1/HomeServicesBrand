import type { AdminProvider } from "@/lib/api";

type PostcodesIoResponse = {
  result?: { latitude: number; longitude: number; postcode: string } | null;
};

export async function geocodeUkPostcode(
  postcode: string
): Promise<{ latitude: number; longitude: number } | null> {
  const compact = postcode.trim().toUpperCase().replace(/\s+/g, "");
  if (compact.length < 5) return null;

  try {
    const res = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(compact)}`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as PostcodesIoResponse;
    if (!data.result) return null;
    return {
      latitude: data.result.latitude,
      longitude: data.result.longitude,
    };
  } catch {
    return null;
  }
}

export async function resolveProviderCoordinates(
  providers: AdminProvider[]
): Promise<AdminProvider[]> {
  return Promise.all(
    providers.map(async (provider) => {
      if (provider.coverageLatitude != null && provider.coverageLongitude != null) {
        return provider;
      }
      if (!provider.coveragePostcode?.trim()) return provider;

      const geo = await geocodeUkPostcode(provider.coveragePostcode);
      if (!geo) return provider;

      return {
        ...provider,
        coverageLatitude: geo.latitude,
        coverageLongitude: geo.longitude,
      };
    })
  );
}

export function mappableProviders(providers: AdminProvider[]) {
  return providers.filter(
    (p) =>
      p.coverageLatitude != null &&
      p.coverageLongitude != null &&
      p.coverageRadiusMiles > 0
  );
}
