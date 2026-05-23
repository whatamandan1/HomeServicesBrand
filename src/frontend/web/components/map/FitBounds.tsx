"use client";

import L from "leaflet";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function FitBounds({
  positions,
  boundsKey,
}: {
  positions: [number, number][];
  boundsKey: string;
}) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    map.fitBounds(L.latLngBounds(positions), { padding: [32, 32] });
    const timer = window.setTimeout(() => map.invalidateSize(), 250);

    return () => window.clearTimeout(timer);
  }, [map, boundsKey]);

  return null;
}
