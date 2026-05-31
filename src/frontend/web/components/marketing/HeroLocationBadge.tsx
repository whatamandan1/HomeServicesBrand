"use client";

import { MapPin } from "lucide-react";
import { useVisitorLocation } from "@/lib/use-visitor-location";

export function HeroLocationBadge() {
  const { badge, ready } = useVisitorLocation();

  return (
    <p
      className="inline-flex items-center gap-2 rounded-full border border-gardens-primary/20 bg-white/80 px-4 py-1.5 text-sm font-medium text-gardens-dark shadow-sm backdrop-blur-sm"
      aria-live="polite"
    >
      <MapPin className="h-4 w-4 shrink-0 text-gardens-primary" aria-hidden />
      <span className={ready ? "" : "text-gardens-dark/70"}>{badge}</span>
    </p>
  );
}
