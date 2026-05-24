const WORKING_DAYS = [
  { label: "Mon", bit: 1 },
  { label: "Tue", bit: 2 },
  { label: "Wed", bit: 4 },
  { label: "Thu", bit: 8 },
  { label: "Fri", bit: 16 },
  { label: "Sat", bit: 32 },
  { label: "Sun", bit: 64 },
] as const;

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
