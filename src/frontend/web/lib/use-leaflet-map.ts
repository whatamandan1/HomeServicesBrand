"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import type { Map as LeafletMap } from "leaflet";
import { attachOsmBaseLayer, loadLeaflet, refreshMapSize } from "@/lib/leaflet-init";

type SetupFn = (
  L: Awaited<ReturnType<typeof loadLeaflet>>,
  map: LeafletMap
) => void;

export function useLeafletMap(
  containerRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  setupKey: string,
  setup: SetupFn
) {
  const mapRef = useRef<LeafletMap | null>(null);
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container || !setupKey) return;

    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

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

      setupRef.current(L, map);
      refreshMapSize(map);

      resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) refreshMapSize(mapRef.current);
      });
      resizeObserver.observe(containerRef.current);
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerRef, enabled, setupKey]);
}
