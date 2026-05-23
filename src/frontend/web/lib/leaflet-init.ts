import type { Map as LeafletMap } from "leaflet";

/** Carto Voyager — reliable raster tiles, works well with Leaflet + Tailwind. */
export const MAP_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
export const MAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

export async function loadLeaflet() {
  return (await import("leaflet")).default;
}

export function refreshMapSize(map: LeafletMap) {
  requestAnimationFrame(() => map.invalidateSize({ pan: false }));
  window.setTimeout(() => map.invalidateSize({ pan: false }), 0);
  window.setTimeout(() => map.invalidateSize({ pan: false }), 100);
  window.setTimeout(() => map.invalidateSize({ pan: false }), 300);
}

export function finalizeMap(map: LeafletMap, afterLayout?: () => void) {
  afterLayout?.();
  refreshMapSize(map);
  map.whenReady(() => {
    refreshMapSize(map);
    afterLayout?.();
  });
}

export async function attachBaseLayer(map: LeafletMap) {
  const L = await loadLeaflet();
  L.tileLayer(MAP_TILE_URL, {
    attribution: MAP_ATTRIBUTION,
    subdomains: "abcd",
    maxZoom: 20,
  }).addTo(map);
}

export async function waitForElementSize(
  element: HTMLElement,
  attempts = 30
): Promise<boolean> {
  for (let i = 0; i < attempts; i += 1) {
    if (element.offsetWidth > 0 && element.offsetHeight > 0) return true;
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
  return element.offsetWidth > 0 && element.offsetHeight > 0;
}
