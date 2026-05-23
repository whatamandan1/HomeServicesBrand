"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AdminProvider } from "@/lib/api";
import { DEFAULT_MAP_CENTER, milesToMeters } from "@/lib/map-utils";
import {
  mappableProviders,
  resolveProviderCoordinates,
} from "@/lib/geocode-postcode";
import { useLeafletMap } from "@/lib/use-leaflet-map";

function MapContainer({
  containerRef,
  loading = false,
  label,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  loading?: boolean;
  label: string;
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
        className="map-shell h-[420px] w-full overflow-hidden rounded-lg border border-stone-200 bg-stone-100 shadow-sm"
        aria-label={label}
      />
    </div>
  );
}

export function ProviderCoverageMap({
  providers,
  emptyMessage = "No provider coverage areas to show on the map.",
}: {
  providers: AdminProvider[];
  emptyMessage?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [resolvedProviders, setResolvedProviders] = useState<AdminProvider[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const providersKey = providers
    .map((p) => `${p.id}:${p.coveragePostcode}:${p.coverageLatitude}:${p.coverageLongitude}`)
    .join("|");

  useEffect(() => {
    let cancelled = false;
    setResolvedProviders(null);
    setLoadError(null);

    void (async () => {
      try {
        const resolved = await resolveProviderCoordinates(providers);
        if (!cancelled) setResolvedProviders(resolved);
      } catch {
        if (!cancelled) setLoadError("Failed to load map data.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [providersKey, providers]);

  const mappable = useMemo(
    () => (resolvedProviders ? mappableProviders(resolvedProviders) : []),
    [resolvedProviders]
  );

  const mapSetupKey = mappable
    .map((p) => `${p.id}:${p.coverageLatitude}:${p.coverageLongitude}:${p.coverageRadiusMiles}`)
    .join("|");

  useLeafletMap(
    containerRef,
    resolvedProviders !== null && mappable.length > 0,
    mapSetupKey,
    (L, map) => {
      const bounds = L.latLngBounds([]);
      const palette = ["#059669", "#0284c7", "#7c3aed", "#db2777", "#ca8a04"];

      mappable.forEach((provider, index) => {
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
    }
  );

  if (loadError) {
    return <p className="mt-2 text-sm text-red-600">{loadError}</p>;
  }

  if (resolvedProviders === null) {
    return (
      <div className="mt-2">
        <MapContainer containerRef={containerRef} loading label="Provider coverage map" />
      </div>
    );
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
      <MapContainer containerRef={containerRef} label="Provider coverage map" />
    </div>
  );
}
