"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { JobVisit } from "@/lib/api";
import {
  type CoverageFallback,
  resolveCoverageAreas,
  resolveVisitCoordinates,
} from "@/lib/geocode-postcode";
import {
  DEFAULT_MAP_CENTER,
  type MapCoverageArea,
  milesToMeters,
  visitMarkerColor,
  visitsWithCoordinates,
} from "@/lib/map-utils";
import { useLeafletMap } from "@/lib/use-leaflet-map";

type VisitMapProps = {
  visits: JobVisit[];
  coverageAreas?: MapCoverageArea[];
  coverageFallback?: CoverageFallback;
  emptyMessage?: string;
  className?: string;
};

function MapContainer({
  containerRef,
  loading = false,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  loading?: boolean;
}) {
  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-stone-100/90 text-sm text-stone-500">
          Loading map…
        </div>
      )}
      <div
        ref={containerRef}
        className="map-shell w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-200 shadow-sm"
        aria-label="Visit map"
      />
    </div>
  );
}

export function VisitMap({
  visits,
  coverageAreas = [],
  coverageFallback,
  emptyMessage = "No visits to show on the map.",
  className = "",
}: VisitMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedVisits, setResolvedVisits] = useState<JobVisit[] | null>(null);
  const [resolvedCoverage, setResolvedCoverage] = useState<MapCoverageArea[] | null>(null);

  const coverageFallbackKey = coverageFallback
    ? `${coverageFallback.postcode}|${coverageFallback.radiusMiles}|${coverageFallback.latitude}|${coverageFallback.longitude}|${coverageFallback.label ?? ""}`
    : "";

  const coverageAreasKey = coverageAreas
    .map((c) => `${c.latitude}:${c.longitude}:${c.radiusMiles}:${c.label ?? ""}`)
    .join("|");

  const visitsKey = visits
    .map((v) => `${v.id}:${v.postcode}:${v.latitude}:${v.longitude}`)
    .join("|");

  useEffect(() => {
    let cancelled = false;
    setResolvedVisits(null);
    setResolvedCoverage(null);

    void (async () => {
      const [nextVisits, nextCoverage] = await Promise.all([
        resolveVisitCoordinates(visits),
        resolveCoverageAreas(coverageAreas, coverageFallback),
      ]);
      if (!cancelled) {
        setResolvedVisits(nextVisits);
        setResolvedCoverage(nextCoverage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visitsKey, coverageAreasKey, coverageFallbackKey, visits, coverageAreas, coverageFallback]);

  const visitPoints = useMemo(
    () => (resolvedVisits ? visitsWithCoordinates(resolvedVisits) : []),
    [resolvedVisits]
  );

  const areas = useMemo(
    () =>
      resolvedCoverage?.filter(
        (c) => c.latitude != null && c.longitude != null && c.radiusMiles > 0
      ) ?? [],
    [resolvedCoverage]
  );

  const mapSetupKey = [
    ...visitPoints.map((v) => `${v.id}:${v.latitude}:${v.longitude}:${v.status}`),
    ...areas.map((a) => `${a.latitude}:${a.longitude}:${a.radiusMiles}`),
  ].join("|");

  const mapReady = resolvedVisits !== null && resolvedCoverage !== null;
  const hasMapContent = visitPoints.length > 0 || areas.length > 0;

  useLeafletMap(containerRef, mapReady && hasMapContent, mapSetupKey, (L, map) => {
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
  });

  if (!mapReady) {
    return (
      <div className={className}>
        <MapContainer containerRef={containerRef} loading />
      </div>
    );
  }

  if (!hasMapContent) {
    return <p className={`text-sm text-stone-500 ${className}`.trim()}>{emptyMessage}</p>;
  }

  const missingCount = resolvedVisits.length - visitPoints.length;

  return (
    <div className={className}>
      {missingCount > 0 && (
        <p className="mb-2 text-xs text-stone-500">
          {missingCount} visit{missingCount === 1 ? "" : "s"} without map coordinates (shown in list view only).
        </p>
      )}
      <MapContainer containerRef={containerRef} />
    </div>
  );
}
