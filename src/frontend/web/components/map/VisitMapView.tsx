"use client";

import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import type { JobVisit } from "@/lib/api";
import type { MapCoverageArea } from "@/lib/map-utils";
import { milesToMeters, visitMarkerColor } from "@/lib/map-utils";
import { escapeHtml } from "@/components/map/escape-html";
import { MAP_ATTRIBUTION, MAP_STYLE, MAP_TILE_URL } from "@/components/map/map-tiles";

type LocatedVisit = JobVisit & { latitude: number; longitude: number };

function formatStatus(status: string) {
  return status.replace(/([A-Z])/g, " $1").trim();
}

export function VisitMapView({
  visits,
  coverageAreas,
}: {
  visits: LocatedVisit[];
  coverageAreas: MapCoverageArea[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const boundsKey = useMemo(
    () =>
      [
        ...visits.map((v) => `${v.id}:${v.latitude},${v.longitude}:${v.status}`),
        ...coverageAreas.map(
          (a) => `${a.latitude},${a.longitude}:${a.radiusMiles}:${a.label ?? ""}`
        ),
      ].join("|"),
    [visits, coverageAreas]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = L.map(container, { scrollWheelZoom: false });
    L.tileLayer(MAP_TILE_URL, { attribution: MAP_ATTRIBUTION }).addTo(map);

    const positions: [number, number][] = [];

    for (const area of coverageAreas) {
      positions.push([area.latitude, area.longitude]);
      L.circle([area.latitude, area.longitude], {
        radius: milesToMeters(area.radiusMiles),
        color: "#059669",
        fillColor: "#059669",
        fillOpacity: 0.08,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(
          area.label
            ? `<strong>${escapeHtml(area.label)}</strong><br/>${area.radiusMiles} mile radius`
            : `${area.radiusMiles} mile radius`
        );
    }

    for (const visit of visits) {
      positions.push([visit.latitude, visit.longitude]);
      const color = visitMarkerColor(visit.status);
      const date =
        typeof visit.scheduledDate === "string" ? visit.scheduledDate.slice(0, 10) : "—";
      const popup = [
        `<strong>${escapeHtml(visit.postcode)}</strong>`,
        `${escapeHtml(date)} · ${escapeHtml(visit.availabilityWindow)}`,
        `Status: ${escapeHtml(formatStatus(visit.status))}`,
        visit.assignedProviderName
          ? `Gardener: ${escapeHtml(visit.assignedProviderName)}`
          : null,
      ]
        .filter(Boolean)
        .join("<br/>");

      L.circleMarker([visit.latitude, visit.longitude], {
        radius: 8,
        color,
        fillColor: color,
        fillOpacity: 0.85,
        weight: 2,
      })
        .addTo(map)
        .bindPopup(popup);
    }

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
  }, [boundsKey, visits, coverageAreas]);

  return (
    <div className="overflow-hidden rounded-lg border border-stone-200 shadow-sm">
      <div ref={containerRef} className="map-shell" style={MAP_STYLE} />
    </div>
  );
}
