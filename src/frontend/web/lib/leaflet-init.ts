import type { Map as LeafletMap } from "leaflet";

export const OSM_TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export async function loadLeaflet() {
  return (await import("leaflet")).default;
}

/** Leaflet often mis-sizes maps inside toggled panels; call after mount and fitBounds. */
export function refreshMapSize(map: LeafletMap) {
  requestAnimationFrame(() => map.invalidateSize());
  window.setTimeout(() => map.invalidateSize(), 0);
  window.setTimeout(() => map.invalidateSize(), 150);
}

export async function attachOsmBaseLayer(map: LeafletMap) {
  const L = await loadLeaflet();
  L.tileLayer(OSM_TILE_URL, {
    attribution: OSM_ATTRIBUTION,
    maxZoom: 19,
  }).addTo(map);
}
