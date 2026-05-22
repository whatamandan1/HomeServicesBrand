export function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-gardens-primary">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}

export function DataTable({
  columns,
  rows,
  emptyMessage = "No data yet.",
}: {
  columns: { key: string; label: string }[];
  rows: Record<string, string | number | boolean | null | undefined>[];
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="mt-2 space-y-3 md:hidden">
        {rows.map((row, i) => (
          <div key={i} className="rounded-xl border bg-white p-4 shadow-sm">
            {columns.map((c) => (
              <div key={c.key} className="flex items-start justify-between gap-4 border-b border-stone-100 py-2.5 last:border-0">
                <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-stone-500">
                  {c.label}
                </span>
                <span className="text-right text-sm font-medium text-stone-800">
                  {String(row[c.key] ?? "—")}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-2 hidden overflow-x-auto rounded-lg border bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    {String(row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    PendingPayment: "bg-amber-100 text-amber-800",
    PastDue: "bg-red-100 text-red-800",
    Scheduled: "bg-stone-100 text-stone-700",
    InProgress: "bg-amber-100 text-amber-900",
    Completed: "bg-green-100 text-green-800",
    Rescheduled: "bg-purple-100 text-purple-800",
    Cancelled: "bg-stone-100 text-stone-600",
    Expired: "bg-stone-100 text-stone-600",
    OpenForClaim: "bg-blue-100 text-blue-800",
    Claimed: "bg-indigo-100 text-indigo-800",
    Open: "bg-red-100 text-red-800",
  };
  const cls = colors[status] ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
