"use client";

import { useMemo, useState } from "react";
import type { AiActionLog } from "@/lib/api";
import { DataTable } from "@/components/ui";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shorten(text: string, max = 80) {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1)}…`;
}

function formatConfidence(score: number | null) {
  if (score === null) return "—";
  return `${Math.round(score * 100)}%`;
}

export function AiActionLogList({
  logs,
  emptyMessage = "No AI actions logged yet.",
}: {
  logs: AiActionLog[];
  emptyMessage?: string;
}) {
  const [actionFilter, setActionFilter] = useState("all");
  const [escalatedOnly, setEscalatedOnly] = useState(false);

  const actionTypes = useMemo(
    () => [...new Set(logs.map((l) => l.actionType))].sort(),
    [logs]
  );

  const filtered = logs.filter((l) => {
    if (escalatedOnly && !l.escalated) return false;
    if (actionFilter !== "all" && l.actionType !== actionFilter) return false;
    return true;
  });

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap items-center gap-4">
        {actionTypes.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="action-filter" className="text-sm text-stone-600">
              Action
            </label>
            <select
              id="action-filter"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              {actionTypes.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        )}
        <label className="flex items-center gap-2 text-sm text-stone-600">
          <input
            type="checkbox"
            checked={escalatedOnly}
            onChange={(e) => setEscalatedOnly(e.target.checked)}
            className="rounded border-stone-300"
          />
          Escalated only
        </label>
      </div>

      <DataTable
        columns={[
          { key: "when", label: "When" },
          { key: "action", label: "Action" },
          { key: "customer", label: "Customer" },
          { key: "prompt", label: "Prompt" },
          { key: "response", label: "Response" },
          { key: "confidence", label: "Conf." },
          { key: "escalated", label: "Esc." },
        ]}
        rows={filtered.map((l) => ({
          when: formatWhen(l.createdAtUtc),
          action: l.actionType,
          customer: l.customerEmail ?? (l.customerId ? l.customerId.slice(0, 8) : "Guest"),
          prompt: shorten(l.promptSummary),
          response: shorten(l.responseSummary),
          confidence: formatConfidence(l.confidenceScore),
          escalated: l.escalated ? "Yes" : "—",
        }))}
        emptyMessage={emptyMessage}
      />
    </div>
  );

}
