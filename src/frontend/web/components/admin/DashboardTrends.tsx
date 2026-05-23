import type { AdminDashboardTrendPoint } from "@/lib/api";

function aggregateWeekly(points: AdminDashboardTrendPoint[]): AdminDashboardTrendPoint[] {
  if (points.length <= 31) return points;

  const buckets = new Map<string, number>();
  for (const point of points) {
    const date = new Date(`${point.date}T00:00:00Z`);
    const day = date.getUTCDay();
    const mondayOffset = (day + 6) % 7;
    const weekStart = new Date(date);
    weekStart.setUTCDate(date.getUTCDate() - mondayOffset);
    const key = weekStart.toISOString().slice(0, 10);
    buckets.set(key, (buckets.get(key) ?? 0) + point.count);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

function TrendChart({
  title,
  points,
  weekly,
}: {
  title: string;
  points: AdminDashboardTrendPoint[];
  weekly: boolean;
}) {
  const chartPoints = weekly ? aggregateWeekly(points) : points;
  const max = Math.max(1, ...chartPoints.map((p) => p.count));
  const total = chartPoints.reduce((sum, p) => sum + p.count, 0);

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold text-gardens-dark">{title}</h3>
        <span className="text-xs text-stone-500">
          {total} total{weekly ? " · weekly" : ""}
        </span>
      </div>
      <div className="mt-4 flex h-28 gap-1">
        {chartPoints.map((point) => (
          <div key={point.date} className="group flex h-full flex-1 flex-col justify-end">
            <div
              className="w-full min-w-[2px] rounded-t bg-gardens-primary/80 transition group-hover:bg-gardens-primary"
              style={{ height: `${Math.max((point.count / max) * 100, point.count > 0 ? 8 : 2)}%` }}
              title={`${point.date}: ${point.count}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-stone-400">
        <span>{chartPoints[0]?.date.slice(5)}</span>
        <span>{chartPoints[chartPoints.length - 1]?.date.slice(5)}</span>
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
  const weekly = trends.newCustomers.length > 31;

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold text-gardens-dark">Trends</h2>
        <p className="text-sm text-stone-500">
          {weekly ? "Weekly activity" : "Daily activity"} from {trends.fromUtc.slice(0, 10)} to{" "}
          {trends.toUtc.slice(0, 10)}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <TrendChart title="New customers" points={trends.newCustomers} weekly={weekly} />
        <TrendChart title="New subscriptions" points={trends.newSubscriptions} weekly={weekly} />
        <TrendChart title="Completed visits" points={trends.completedVisits} weekly={weekly} />
      </div>
    </section>
  );
}
