/** Normalise API visit status strings for comparisons and UI. */
export function normalizeVisitStatus(status: string): string {
  return status.replace(/\s+/g, "").toLowerCase();
}

export function visitNextAction(status: string): "start" | "complete" | null {
  const s = normalizeVisitStatus(status);
  if (s === "claimed") return "start";
  if (s === "inprogress") return "complete";
  return null;
}

export function isActiveVisit(status: string): boolean {
  const s = normalizeVisitStatus(status);
  return s !== "completed" && s !== "cancelled";
}
