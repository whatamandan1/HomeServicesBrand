"use client";

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

    try {
      if (positions.length === 1) {
        map.setView(positions[0], 13);
      } else {
        map.fitBounds(positions, { padding: [32, 32] });
      }
    } catch {
      map.setView(positions[0], 11);
    }

    const timer = window.setTimeout(() => map.invalidateSize(), 250);
    return () => window.clearTimeout(timer);
  }, [map, boundsKey]);

  return null;
}
