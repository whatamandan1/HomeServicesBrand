"use client";

import { useEffect, useRef } from "react";
import type { AdminProvider } from "@/lib/api";
import { DEFAULT_MAP_CENTER, milesToMeters } from "@/lib/map-utils";

export function ProviderCoverageMap({
  providers,
  emptyMessage = "No provider coverage areas to show on the map.",
}: {
  providers: AdminProvider[];
  emptyMessage?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  const mappable = providers.filter(
    (p) => p.coverageLatitude != null && p.coverageLongitude != null && p.coverageRadiusMiles > 0
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const mappableNow = providers.filter(
      (p) => p.coverageLatitude != null && p.coverageLongitude != null && p.coverageRadiusMiles > 0
    );
    if (mappableNow.length === 0) return;

    let cancelled = false;

    void (async () => {
      const L = (await import("leaflet")).default;

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, { scrollWheelZoom: false });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      const palette = ["#059669", "#0284c7", "#7c3aed", "#db2777", "#ca8a04"];

      mappableNow.forEach((provider, index) => {
        const lat = provider.coverageLatitude!;
        const lon = provider.coverageLongitude!;
        const color = palette[index % palette.length];

        const circle = L.circle([lat, lon], {
          radius: milesToMeters(provider.coverageRadiusMiles),
          color,
          fillColor: color,
          fillOpacity: 0.1,
          weight: 2,
        }).addTo(map);

        const center = L.circleMarker([lat, lon], {
          radius: 6,
          color,
          fillColor: color,
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);

        const label = `<strong>${provider.name}</strong><br/>${provider.coveragePostcode ?? "—"}, ${provider.coverageRadiusMiles} miles${provider.isApproved ? "" : " · pending approval"}`;
        circle.bindPopup(label);
        center.bindPopup(label);

        bounds.extend(circle.getBounds());
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.12));
      } else {
        map.setView(DEFAULT_MAP_CENTER, 11);
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [providers]);

  if (mappable.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  const missingCount = providers.length - mappable.length;

  return (
    <div>
      {missingCount > 0 && (
        <p className="mb-2 text-xs text-stone-500">
          {missingCount} provider{missingCount === 1 ? "" : "s"} without map coordinates.
        </p>
      )}
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-lg border border-stone-200 shadow-sm"
        aria-label="Provider coverage map"
      />
    </div>
  );
}
