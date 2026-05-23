"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import type { Map as LeafletMap } from "leaflet";
import {
  attachBaseLayer,
  finalizeMap,
  loadLeaflet,
  waitForElementSize,
} from "@/lib/leaflet-init";

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
      const sized = await waitForElementSize(container);
      if (cancelled || !containerRef.current || !sized) return;

      const L = await loadLeaflet();
      if (cancelled || !containerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        scrollWheelZoom: false,
        preferCanvas: true,
      });
      mapRef.current = map;
      await attachBaseLayer(map);

      finalizeMap(map, () => {
        setupRef.current(L, map);
      });

      resizeObserver = new ResizeObserver(() => {
        if (mapRef.current) finalizeMap(mapRef.current);
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
