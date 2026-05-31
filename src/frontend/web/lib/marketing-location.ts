/** Launch hubs - used to personalise homepage location copy from visitor coordinates. */
export type ServiceHub = {
  id: string;
  label: string;
  areaLabel: string;
  examplePostcode: string;
  lat: number;
  lon: number;
};

export const SERVICE_HUBS: ServiceHub[] = [
  {
    id: "leeds",
    label: "Leeds",
    areaLabel: "Leeds & West Yorkshire",
    examplePostcode: "LS8 4AP",
    lat: 53.8008,
    lon: -1.5491,
  },
  {
    id: "york",
    label: "York",
    areaLabel: "York & North Yorkshire",
    examplePostcode: "YO10 4AW",
    lat: 53.959,
    lon: -1.0815,
  },
  {
    id: "wakefield",
    label: "Wakefield",
    areaLabel: "Wakefield & South Yorkshire",
    examplePostcode: "WF1 2UP",
    lat: 53.6833,
    lon: -1.5057,
  },
  {
    id: "harrogate",
    label: "Harrogate",
    areaLabel: "Harrogate & the Dales",
    examplePostcode: "HG1 1BB",
    lat: 53.9928,
    lon: -1.5412,
  },
];

export const DEFAULT_LOCATION_BADGE = "Yorkshire · Leeds, York, Wakefield";

export type VisitorCoords = {
  lat: number;
  lon: number;
  source: "edge" | "browser";
  city?: string | null;
  country?: string | null;
};

export type VisitorLocationDisplay = {
  badge: string;
  hub: ServiceHub;
  inServiceArea: boolean;
};

const EARTH_RADIUS_MILES = 3958.8;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceMiles(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.min(1, Math.sqrt(h)));
}

function nearestHub(coords: { lat: number; lon: number }) {
  let best = SERVICE_HUBS[0];
  let bestDist = distanceMiles(coords, best);
  for (const hub of SERVICE_HUBS.slice(1)) {
    const d = distanceMiles(coords, hub);
    if (d < bestDist) {
      best = hub;
      bestDist = d;
    }
  }
  return { hub: best, miles: bestDist };
}

function hubFromCityName(city: string | null | undefined): ServiceHub | null {
  if (!city?.trim()) return null;
  const normalized = city.trim().toLowerCase();
  return (
    SERVICE_HUBS.find(
      (h) =>
        normalized === h.label.toLowerCase() ||
        normalized.includes(h.label.toLowerCase())
    ) ?? null
  );
}

function isUkCountry(country: string | null | undefined) {
  if (!country?.trim()) return true;
  const c = country.trim().toUpperCase();
  return c === "GB" || c === "UK" || c === "UNITED KINGDOM";
}

/** Rough UK mainland bounds (excludes most of Ireland). */
export function isLikelyUkCoords(coords: { lat: number; lon: number }) {
  return coords.lat >= 49.5 && coords.lat <= 61 && coords.lon >= -8.5 && coords.lon <= 2;
}

export function resolveVisitorLocationDisplay(
  coords: VisitorCoords | null
): VisitorLocationDisplay {
  const fallbackHub = SERVICE_HUBS[0];
  if (!coords || !isLikelyUkCoords(coords)) {
    return {
      badge: DEFAULT_LOCATION_BADGE,
      hub: fallbackHub,
      inServiceArea: false,
    };
  }

  const { hub, miles } = nearestHub(coords);
  const cityHub = hubFromCityName(coords.city);

  if (miles <= 28) {
    const label = cityHub?.areaLabel ?? hub.areaLabel;
    return {
      badge: `Near you · ${label}`,
      hub: cityHub ?? hub,
      inServiceArea: true,
    };
  }

  if (miles <= 55 && isUkCountry(coords.country)) {
    return {
      badge: `Yorkshire · ${hub.label} area`,
      hub,
      inServiceArea: true,
    };
  }

  if (isUkCountry(coords.country)) {
    return {
      badge: "Sorting Yorkshire · Leeds, York, Wakefield",
      hub: fallbackHub,
      inServiceArea: false,
    };
  }

  return {
    badge: DEFAULT_LOCATION_BADGE,
    hub: fallbackHub,
    inServiceArea: false,
  };
}
