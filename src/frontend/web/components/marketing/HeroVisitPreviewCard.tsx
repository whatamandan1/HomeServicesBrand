"use client";

import { CalendarCheck, UserRound } from "lucide-react";
import { useVisitorLocation } from "@/lib/use-visitor-location";

export function HeroVisitPreviewCard({ compact = false }: { compact?: boolean }) {
  const { examplePostcode, ready } = useVisitorLocation();

  return (
    <div className="overflow-hidden rounded-2xl border border-gardens-primary/20 bg-white shadow-lg ring-1 ring-gardens-primary/5">
      <div
        className={`flex items-start justify-between gap-3 border-b border-gardens-primary/10 bg-gardens-dark ${
          compact ? "px-4 py-2.5" : "px-5 py-3"
        }`}
      >
        <div>
          <p className="text-sm font-semibold text-white">GardensSorted</p>
          <p className="text-xs text-gardens-accent/90">Your visits</p>
        </div>
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gardens-accent">
          Preview
        </span>
      </div>
      <div className={`bg-gradient-to-b from-gardens-light/40 to-white ${compact ? "p-4" : "p-5 sm:p-6"}`}>
        <p className="text-sm font-medium text-stone-500">Your next visit</p>
        <p
          className={`mt-2 font-display font-semibold text-gardens-dark ${
            compact ? "text-lg" : "mt-3 text-xl"
          }`}
        >
          Thu 12 Jun · {ready ? examplePostcode : "LS8 4AP"}
        </p>
        <p className="mt-1 flex items-center gap-2 text-sm text-stone-700">
          <CalendarCheck className="h-4 w-4 shrink-0 text-gardens-primary" />
          Morning window · 9am–12pm
        </p>
        <span className="mt-3 inline-flex rounded-full bg-gardens-primary/15 px-2.5 py-0.5 text-xs font-semibold text-gardens-dark">
          Confirmed
        </span>
        <p className="mt-3 flex items-center gap-2 text-sm text-stone-700">
          <UserRound className="h-4 w-4 shrink-0 text-gardens-primary" />
          Gardener: Alex R.
        </p>
        {!compact && (
          <>
            <div className="mt-5 hidden gap-3 border-t border-gardens-primary/10 pt-4 text-sm text-stone-500 sm:flex">
              <span>Reschedule</span>
              <span aria-hidden>·</span>
              <span>View account</span>
            </div>
            <p className="mt-4 text-xs text-stone-500">Example from a customer account - yours will look like this.</p>
          </>
        )}
      </div>
    </div>
  );
}
