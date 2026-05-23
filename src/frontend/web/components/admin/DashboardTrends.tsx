import type { AdminDashboardTrendPoint } from "@/lib/api";

function TrendChart({
  title,
  points,
}: {
  title: string;
  points: AdminDashboardTrendPoint[];
}) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const total = points.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-gardens-dark">{title}</h3>
        <span className="text-xs text-stone-500">{total} total</span>
      </div>
      <div className="mt-4 flex h-28 items-end gap-1">
        {points.map((point) => (
          <div key={point.date} className="group flex flex-1 flex-col items-center justify-end">
            <div
              className="w-full rounded-t bg-gardens-primary/80 transition group-hover:bg-gardens-primary"
              style={{ height: `${Math.max((point.count / max) * 100, point.count > 0 ? 8 : 2)}%` }}
              title={`${point.date}: ${point.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-stone-400">
        <span>{points[0]?.date.slice(5)}</span>
        <span>{points[points.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}

export function DashboardTrends({
  trends,
}: {
  trends: {
    fromUtc: string;
    toUtc: string;
    newCustomers: AdminDashboardTrendPoint[];
    newSubscriptions: AdminDashboardTrendPoint[];
    completedVisits: AdminDashboardTrendPoint[];
  };
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold text-gardens-dark">Trends</h2>
        <p className="text-sm text-stone-500">
          Daily activity from {trends.fromUtc.slice(0, 10)} to {trends.toUtc.slice(0, 10)}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart title="New customers" points={trends.newCustomers} />
        <TrendChart title="New subscriptions" points={trends.newSubscriptions} />
        <TrendChart title="Completed visits" points={trends.completedVisits} />
      </div>
    </section>
  );
}
