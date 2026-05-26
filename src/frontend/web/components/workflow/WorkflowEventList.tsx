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
  if (!id) return "—";
  return id.slice(0, 8);
}

export function WorkflowEventList({
  events,
  emptyMessage = "No workflow events yet.",
}: {
  events: WorkflowEvent[];
  emptyMessage?: string;
}) {
  const [workflowFilter, setWorkflowFilter] = useState("all");

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

  if (events.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  return (
    <div className="mt-2 space-y-3">
      {workflows.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="workflow-filter" className="text-sm text-stone-600">
            Workflow
          </label>
          <select
            id="workflow-filter"
            value={workflowFilter}
            onChange={(e) => setWorkflowFilter(e.target.value)}
            className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm"
          >
            <option value="all">All</option>
            {workflows.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </div>
      )}

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
            : "—",
          payload: shortenPayload(e.payloadJson),
        }))}
        emptyMessage={controls.query ? "No events match your search." : emptyMessage}
      />
    </div>
  );
}
