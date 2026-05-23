"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import type { AdminProvider } from "@/lib/api";
import { milesToMeters } from "@/lib/map-utils";
import { escapeHtml } from "@/components/map/escape-html";
import { MAP_ATTRIBUTION, MAP_STYLE, MAP_TILE_URL } from "@/components/map/map-tiles";

const PALETTE = ["#059669", "#0284c7", "#7c3aed", "#db2777", "#ca8a04"];

export function ProviderCoverageMapView({ providers }: { providers: AdminProvider[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const boundsKey = useMemo(
    () =>
      providers
        .map(
          (p) =>
            `${p.id}:${p.coverageLatitude},${p.coverageLongitude}:${p.coverageRadiusMiles}:${p.isApproved}`
        )
        .join("|"),
    [providers]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { scrollWheelZoom: false });
    L.tileLayer(MAP_TILE_URL, { attribution: MAP_ATTRIBUTION }).addTo(map);

    const positions: [number, number][] = providers.map((p) => [
      p.coverageLatitude!,
      p.coverageLongitude!,
    ]);

    providers.forEach((provider, index) => {
      const lat = provider.coverageLatitude!;
      const lon = provider.coverageLongitude!;
      const color = PALETTE[index % PALETTE.length];
      const label = `${provider.coveragePostcode ?? "—"}, ${provider.coverageRadiusMiles} miles${
        provider.isApproved ? "" : " · pending approval"
      }`;
      const popup = `<strong>${escapeHtml(provider.name)}</strong><br/>${escapeHtml(label)}`;

      L.circle([lat, lon], {
        radius: milesToMeters(provider.coverageRadiusMiles),
        color,
        fillColor: color,
        fillOpacity: 0.1,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(popup);

      L.circleMarker([lat, lon], {
        radius: 6,
        color,
        fillColor: color,
        fillOpacity: 1,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(popup);
    });

    if (positions.length === 1) {
      map.setView(positions[0], 13);
    } else if (positions.length > 1) {
      map.fitBounds(positions, { padding: [32, 32] });
    }

    const timer = window.setTimeout(() => map.invalidateSize(), 150);

    return () => {
      window.clearTimeout(timer);
      map.remove();
    };
  }, [boundsKey, providers]);

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 shadow-sm">
      <div ref={containerRef} className="map-shell" style={MAP_STYLE} />
    </div>
  );
}
