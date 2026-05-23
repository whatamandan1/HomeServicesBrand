"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { JobVisit } from "@/lib/api";
import {
  type CoverageFallback,
  resolveCoverageAreas,
  resolveVisitCoordinates,
} from "@/lib/geocode-postcode";
import { type MapCoverageArea, visitsWithCoordinates } from "@/lib/map-utils";

const VisitMapView = dynamic(
  () => import("@/components/map/VisitMapView").then((m) => m.VisitMapView),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-sm text-stone-500"
        style={{ height: 420 }}
      >
        Loading map…
      </div>
    ),
  }
);

type VisitMapProps = {
  visits: JobVisit[];
  coverageAreas?: MapCoverageArea[];
  coverageFallback?: CoverageFallback;
  emptyMessage?: string;
  className?: string;
};

export function VisitMap({
  visits,
  coverageAreas = [],
  coverageFallback,
  emptyMessage = "No visits to show on the map.",
  className = "",
}: VisitMapProps) {
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
    // Keys encode visit/coverage data; object refs in deps caused infinite re-fetch loops.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitsKey, coverageAreasKey, coverageFallbackKey]);

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

  const mapReady = resolvedVisits !== null && resolvedCoverage !== null;
  const hasMapContent = visitPoints.length > 0 || areas.length > 0;

  if (!mapReady) {
    return (
      <div className={className}>
        <div
          className="flex items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-sm text-stone-500"
          style={{ height: 420 }}
        >
          Loading map…
        </div>
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
      <VisitMapView visits={visitPoints} coverageAreas={areas} />
    </div>
  );
}
