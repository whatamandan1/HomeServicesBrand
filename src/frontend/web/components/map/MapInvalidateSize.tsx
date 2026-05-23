"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Leaflet often renders a grey pane until the container size is measured. */
export function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    let cancelled = false;

    const invalidate = () => {
      if (cancelled) return;
      try {
        map.invalidateSize({ animate: false });
      } catch {
        // Map was unmounted (e.g. React Strict Mode).
      }
    };

    const raf = requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 350);

    const container = map.getContainer();
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);

    map.whenReady(() => {
      if (!cancelled) invalidate();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}
