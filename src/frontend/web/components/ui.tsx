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
    <div className="mt-2 overflow-x-auto rounded-lg border bg-white shadow-sm">
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
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: "bg-green-100 text-green-800",
    PendingPayment: "bg-amber-100 text-amber-800",
    OpenForClaim: "bg-blue-100 text-blue-800",
    Claimed: "bg-indigo-100 text-indigo-800",
    Open: "bg-red-100 text-red-800",
    Completed: "bg-stone-100 text-stone-800",
  };
  const cls = colors[status] ?? "bg-stone-100 text-stone-700";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}
