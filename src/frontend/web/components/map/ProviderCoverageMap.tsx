"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import type { AdminProvider } from "@/lib/api";
import {
  mappableProviders,
  resolveProviderCoordinates,
} from "@/lib/geocode-postcode";

const ProviderCoverageMapView = dynamic(
  () =>
    import("@/components/map/ProviderCoverageMapView").then(
      (m) => m.ProviderCoverageMapView
    ),
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

export function ProviderCoverageMap({
  providers,
  emptyMessage = "No provider coverage areas to show on the map.",
}: {
  providers: AdminProvider[];
  emptyMessage?: string;
}) {
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

  if (loadError) {
    return <p className="mt-2 text-sm text-red-600">{loadError}</p>;
  }

  if (resolvedProviders === null) {
    return (
      <div
        className="mt-2 flex items-center justify-center rounded-lg border border-stone-200 bg-stone-100 text-sm text-stone-500"
        style={{ height: 420 }}
      >
        Loading map…
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
      <ProviderCoverageMapView providers={mappable} />
    </div>
  );
}
