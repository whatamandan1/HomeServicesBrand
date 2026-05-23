export type MapCoverageArea = {
  latitude: number;
  longitude: number;
  radiusMiles: number;
  label?: string;
};

export const DEFAULT_MAP_CENTER: [number, number] = [53.7991, -1.5491];

export function visitMarkerColor(status: string): string {
  switch (status) {
    case "OpenForClaim":
      return "#059669";
    case "Claimed":
      return "#d97706";
    case "InProgress":
      return "#ea580c";
    case "Completed":
      return "#78716c";
    case "Cancelled":
      return "#a8a29e";
    default:
      return "#0284c7";
  }
}

export function visitsWithCoordinates<T extends { latitude?: number | null; longitude?: number | null }>(
  visits: T[]
): (T & { latitude: number; longitude: number })[] {
  return visits.filter(
    (v): v is T & { latitude: number; longitude: number } =>
      v.latitude != null && v.longitude != null
  );
}

export function milesToMeters(miles: number) {
  return miles * 1609.344;
}
