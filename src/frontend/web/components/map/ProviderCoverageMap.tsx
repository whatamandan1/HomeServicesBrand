"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminProvider } from "@/lib/api";
import { DEFAULT_MAP_CENTER, milesToMeters } from "@/lib/map-utils";
import {
  mappableProviders,
  resolveProviderCoordinates,
} from "@/lib/geocode-postcode";
import { attachOsmBaseLayer, loadLeaflet, refreshMapSize } from "@/lib/leaflet-init";

export function ProviderCoverageMap({
  providers,
  emptyMessage = "No provider coverage areas to show on the map.",
}: {
  providers: AdminProvider[];
  emptyMessage?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const [resolvedProviders, setResolvedProviders] = useState<AdminProvider[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResolvedProviders(null);

    void (async () => {
      const resolved = await resolveProviderCoordinates(providers);
      if (!cancelled) setResolvedProviders(resolved);
    })();

    return () => {
      cancelled = true;
    };
  }, [providers]);

  const mappable = useMemo(
    () => (resolvedProviders ? mappableProviders(resolvedProviders) : []),
    [resolvedProviders]
  );

  useEffect(() => {
    if (!containerRef.current || mappable.length === 0) return;

    let cancelled = false;
    const points = [...mappable];

    void (async () => {
      const L = await loadLeaflet();

      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, { scrollWheelZoom: false });
      mapRef.current = map;
      await attachOsmBaseLayer(map);

      const bounds = L.latLngBounds([]);
      const palette = ["#059669", "#0284c7", "#7c3aed", "#db2777", "#ca8a04"];

      points.forEach((provider, index) => {
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

      refreshMapSize(map);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [mappable]);

  if (resolvedProviders === null) {
    return <p className="mt-2 text-sm text-stone-500">Loading map…</p>;
  }

  if (mappable.length === 0) {
    const withPostcode = resolvedProviders.filter((p) => p.coveragePostcode?.trim());
    return (
      <p className="mt-2 text-sm text-stone-500">
        {withPostcode.length > 0
          ? "Could not resolve map coordinates for provider postcodes."
          : emptyMessage}
      </p>
    );
  }

  const missingCount = resolvedProviders.length - mappable.length;

  return (
    <div className="mt-2">
      {missingCount > 0 && (
        <p className="mb-2 text-xs text-stone-500">
          {missingCount} provider{missingCount === 1 ? "" : "s"} without map coordinates.
        </p>
      )}
      <div
        ref={containerRef}
        className="h-[420px] w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm"
        aria-label="Provider coverage map"
      />
    </div>
  );
}
