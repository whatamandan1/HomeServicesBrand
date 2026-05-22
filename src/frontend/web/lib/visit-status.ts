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

export function canManageVisit(status: string, allowInProgress = false): boolean {
  const s = normalizeVisitStatus(status);
  if (s === "completed" || s === "cancelled") return false;
  if (s === "inprogress") return allowInProgress;
  return true;
}

export function toApiDate(date: string): string {
  return `${date}T12:00:00.000Z`;
}

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
