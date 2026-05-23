"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";

/** Leaflet often renders a grey pane until the container size is measured. */
export function MapInvalidateSize() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize({ animate: false });

    const raf = requestAnimationFrame(invalidate);
    const timer = window.setTimeout(invalidate, 350);

    const container = map.getContainer();
    const observer = new ResizeObserver(invalidate);
    observer.observe(container);

    map.whenReady(invalidate);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [map]);

  return null;
}
