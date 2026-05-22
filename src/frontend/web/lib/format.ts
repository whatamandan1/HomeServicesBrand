export function formatGbp(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}
