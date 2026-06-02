"use client";

import { useCallback, useMemo, useState } from "react";
import type { WorkflowEvent } from "@/lib/api";
import { DataTable } from "@/components/ui";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import {
  DEFAULT_ADMIN_TABLE_PAGE_SIZE,
  matchesSearch,
  useAdminListControls,
} from "@/lib/admin-list-controls";

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shortenPayload(json: string) {
  const compact = json.replace(/\s+/g, " ").trim();
  if (compact.length <= 80) return compact;
  return `${compact.slice(0, 77)}…`;
}

function shortenId(id: string | null) {
  if (!id) return "-";
  return id.slice(0, 8);
}

function formatPayload(json: string) {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

export function WorkflowEventList({
  events,
  emptyMessage = "No workflow events yet.",
  onWorkflowFilterChange,
  onRefresh,
  refreshing = false,
}: {
  events: WorkflowEvent[];
  emptyMessage?: string;
  onWorkflowFilterChange?: (workflow: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const [workflowFilter, setWorkflowFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState<WorkflowEvent | null>(null);

  const workflows = useMemo(
    () => [...new Set(events.map((e) => e.workflowName))].sort(),
    [events]
  );

  const workflowFiltered =
    workflowFilter === "all"
      ? events
      : events.filter((e) => e.workflowName === workflowFilter);

  const searchFn = useCallback(
    (event: WorkflowEvent, query: string) =>
      matchesSearch(
        query,
        event.workflowName,
        event.eventName,
        event.entityType,
        event.entityId,
        event.payloadJson,
        formatWhen(event.createdAtUtc)
      ),
    []
  );

  const controls = useAdminListControls(workflowFiltered, searchFn, DEFAULT_ADMIN_TABLE_PAGE_SIZE);

  function handleWorkflowChange(value: string) {
    setWorkflowFilter(value);
    onWorkflowFilterChange?.(value);
  }

  if (events.length === 0 && !refreshing) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  return (
    <div className="mt-2 space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {workflows.length > 1 && (
          <>
            <label htmlFor="workflow-filter" className="text-sm text-stone-600">
              Workflow
            </label>
            <select
              id="workflow-filter"
              value={workflowFilter}
              onChange={(e) => handleWorkflowChange(e.target.value)}
              className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All</option>
              {workflows.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </>
        )}
        {onRefresh && (
          <button
            type="button"
            disabled={refreshing}
            onClick={onRefresh}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
          >
            {refreshing ? "Refreshing…" : "Refresh log"}
          </button>
        )}
      </div>

      <AdminListToolbar
        controls={controls}
        placeholder="Search workflow, event, entity, payload…"
      />

      <DataTable
        columns={[
          { key: "when", label: "When" },
          { key: "workflow", label: "Workflow" },
          { key: "event", label: "Event" },
          { key: "entity", label: "Entity" },
          { key: "payload", label: "Payload" },
        ]}
        rows={controls.pageItems.map((e) => ({
          when: formatWhen(e.createdAtUtc),
          workflow: e.workflowName,
          event: e.eventName,
          entity: e.entityType
            ? `${e.entityType} ${shortenId(e.entityId)}`
            : "-",
          payload: shortenPayload(e.payloadJson),
          onClick: () => setSelectedEvent(e),
        }))}
        emptyMessage={controls.query ? "No events match your search." : emptyMessage}
      />

      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="workflow-event-title"
        >
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-5 py-4">
              <div>
                <h3 id="workflow-event-title" className="font-semibold text-gardens-dark">
                  {selectedEvent.workflowName} · {selectedEvent.eventName}
                </h3>
                <p className="mt-1 text-sm text-stone-500">
                  {formatWhen(selectedEvent.createdAtUtc)}
                  {selectedEvent.entityType && selectedEvent.entityId
                    ? ` · ${selectedEvent.entityType} ${selectedEvent.entityId}`
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-sm text-stone-500 hover:text-stone-800"
              >
                Close
              </button>
            </div>
            <pre className="max-h-[60vh] overflow-auto p-5 text-xs text-stone-800">
              {formatPayload(selectedEvent.payloadJson)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
