import type { AdminProvider, JobVisit } from "@/lib/api";
import type { MapCoverageArea } from "@/lib/map-utils";

type GeoResponse = {
  postcode: string;
  latitude: number;
  longitude: number;
};

async function geocodeViaApi(
  postcode: string
): Promise<{ latitude: number; longitude: number } | null> {
  const compact = postcode.trim().toUpperCase().replace(/\s+/g, "");
  if (compact.length < 5) return null;

  try {
    const res = await fetch(`/api/geo/postcodes/${encodeURIComponent(compact)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as GeoResponse;
    return { latitude: data.latitude, longitude: data.longitude };
  } catch {
    return null;
  }
}

export async function geocodeUkPostcode(
  postcode: string
): Promise<{ latitude: number; longitude: number } | null> {
  return geocodeViaApi(postcode);
}

export async function resolveVisitCoordinates(visits: JobVisit[]): Promise<JobVisit[]> {
  return Promise.all(
    visits.map(async (visit) => {
      if (visit.latitude != null && visit.longitude != null) return visit;
      if (!visit.postcode?.trim()) return visit;

      const geo = await geocodeViaApi(visit.postcode);
      if (!geo) return visit;

      return {
        ...visit,
        latitude: geo.latitude,
        longitude: geo.longitude,
      };
    })
  );
}

export type CoverageFallback = {
  postcode: string;
  radiusMiles: number;
  latitude?: number | null;
  longitude?: number | null;
  label?: string;
};

export async function resolveCoverageAreas(
  coverageAreas: MapCoverageArea[],
  fallback?: CoverageFallback
): Promise<MapCoverageArea[]> {
  const resolved = [
    ...coverageAreas.filter(
      (c) => c.latitude != null && c.longitude != null && c.radiusMiles > 0
    ),
  ];

  if (resolved.length > 0 || !fallback?.postcode?.trim() || fallback.radiusMiles <= 0) {
    return resolved;
  }

  let latitude = fallback.latitude ?? null;
  let longitude = fallback.longitude ?? null;

  if (latitude == null || longitude == null) {
    const geo = await geocodeViaApi(fallback.postcode);
    if (!geo) return resolved;
    latitude = geo.latitude;
    longitude = geo.longitude;
  }

  resolved.push({
    latitude,
    longitude,
    radiusMiles: fallback.radiusMiles,
    label: fallback.label ?? `Coverage (${fallback.postcode})`,
  });

  return resolved;
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

      const geo = await geocodeViaApi(provider.coveragePostcode);
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
