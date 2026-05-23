"use client";

import { useEffect, useRef } from "react";
import type { JobVisit } from "@/lib/api";
import {
  DEFAULT_MAP_CENTER,
  type MapCoverageArea,
  milesToMeters,
  visitMarkerColor,
  visitsWithCoordinates,
} from "@/lib/map-utils";

type VisitMapProps = {
  visits: JobVisit[];
  coverageAreas?: MapCoverageArea[];
  emptyMessage?: string;
  className?: string;
};

export function VisitMap({
  visits,
  coverageAreas = [],
  emptyMessage = "No visits to show on the map.",
  className = "",
}: VisitMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  const located = visitsWithCoordinates(visits);
  const mappableCoverage = coverageAreas.filter(
    (c) => c.latitude != null && c.longitude != null && c.radiusMiles > 0
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;
    const visitPoints = visitsWithCoordinates(visits);
    const areas = coverageAreas.filter(
      (c) => c.latitude != null && c.longitude != null && c.radiusMiles > 0
    );

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

      for (const area of areas) {
        const circle = L.circle([area.latitude, area.longitude], {
          radius: milesToMeters(area.radiusMiles),
          color: "#059669",
          fillColor: "#059669",
          fillOpacity: 0.08,
          weight: 2,
        }).addTo(map);

        if (area.label) {
          circle.bindPopup(`<strong>${area.label}</strong><br/>${area.radiusMiles} mile radius`);
        }

        bounds.extend(circle.getBounds());
      }

      for (const visit of visitPoints) {
        const color = visitMarkerColor(visit.status);
        const marker = L.circleMarker([visit.latitude, visit.longitude], {
          radius: 8,
          color,
          fillColor: color,
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(map);

        const date = visit.scheduledDate.slice(0, 10);
        const provider = visit.assignedProviderName
          ? `<br/>Gardener: ${visit.assignedProviderName}`
          : "";
        marker.bindPopup(
          `<strong>${visit.postcode}</strong><br/>${date} · ${visit.availabilityWindow}<br/>Status: ${visit.status.replace(/([A-Z])/g, " $1").trim()}${provider}`
        );

        bounds.extend([visit.latitude, visit.longitude]);
      }

      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.15));
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
  }, [visits, coverageAreas]);

  if (located.length === 0 && mappableCoverage.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  const missingCount = visits.length - located.length;

  return (
    <div className={className}>
      {missingCount > 0 && (
        <p className="mb-2 text-xs text-stone-500">
          {missingCount} visit{missingCount === 1 ? "" : "s"} without map coordinates (shown in list view only).
        </p>
      )}
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-lg border border-stone-200 shadow-sm"
        aria-label="Visit map"
      />
    </div>
  );
}
