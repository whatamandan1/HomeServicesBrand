const WORKING_DAYS = [
  { label: "Mon", bit: 1 },
  { label: "Tue", bit: 2 },
  { label: "Wed", bit: 4 },
  { label: "Thu", bit: 8 },
  { label: "Fri", bit: 16 },
  { label: "Sat", bit: 32 },
  { label: "Sun", bit: 64 },
] as const;

export const PROVIDER_WORKING_DAYS = WORKING_DAYS;

export function isWorkingDaySelected(mask: number, bit: number) {
  return (mask & bit) !== 0;
}

export function toggleWorkingDay(mask: number, bit: number) {
  return isWorkingDaySelected(mask, bit) ? mask & ~bit : mask | bit;
}

export function formatWorkingDays(mask: number): string {
  const selected = WORKING_DAYS.filter((day) => (mask & day.bit) !== 0).map((day) => day.label);
  return selected.length > 0 ? selected.join(", ") : "None";
}

export function formatMoneyGbp(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(amount);
}
