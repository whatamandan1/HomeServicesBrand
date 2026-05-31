"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_LOCATION_BADGE,
  resolveVisitorLocationDisplay,
  SERVICE_HUBS,
  type VisitorCoords,
  type VisitorLocationDisplay,
} from "@/lib/marketing-location";

const STORAGE_KEY = "gardensorted-visitor-coords-v1";

let sharedPromise: Promise<VisitorLocationDisplay> | null = null;

function readStoredCoords(): VisitorCoords | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorCoords;
    if (typeof parsed.lat === "number" && typeof parsed.lon === "number") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function storeCoords(coords: VisitorCoords) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(coords));
  } catch {
    /* ignore */
  }
}

function browserGeolocation(timeoutMs = 5000): Promise<VisitorCoords | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.clearTimeout(timer);
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "browser",
          country: "GB",
        });
      },
      () => {
        window.clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: timeoutMs }
    );
  });
}

async function fetchEdgeCoords(): Promise<VisitorCoords | null> {
  try {
    const res = await fetch("/api/visitor-location", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { coords: VisitorCoords | null };
    return data.coords;
  } catch {
    return null;
  }
}

async function resolveLocation(): Promise<VisitorLocationDisplay> {
  const stored = readStoredCoords();
  if (stored) return resolveVisitorLocationDisplay(stored);

  let coords = await fetchEdgeCoords();
  if (!coords) coords = await browserGeolocation();
  if (coords) storeCoords(coords);

  return resolveVisitorLocationDisplay(coords);
}

export function useVisitorLocation() {
  const [display, setDisplay] = useState<VisitorLocationDisplay>(() =>
    resolveVisitorLocationDisplay(null)
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!sharedPromise) sharedPromise = resolveLocation();
    let cancelled = false;

    void sharedPromise.then((result) => {
      if (!cancelled) {
        setDisplay(result);
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ready,
    badge: display.badge,
    hub: display.hub,
    inServiceArea: display.inServiceArea,
    defaultBadge: DEFAULT_LOCATION_BADGE,
    examplePostcode: display.hub.examplePostcode,
  };
}

/** For tests or Storybook — reset cached lookup. */
export function resetVisitorLocationCache() {
  sharedPromise = null;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export { SERVICE_HUBS };
