"use client";

import { useCallback, useState } from "react";
import type { CommunicationThreadDetail, CommunicationThreadSummary } from "@/lib/api";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import {
  DEFAULT_ADMIN_TABLE_PAGE_SIZE,
  matchesSearch,
  useAdminListControls,
  withPinnedItem,
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

function MessageBubble({
  senderRole,
  body,
  isFromAi,
  createdAtUtc,
}: {
  senderRole: string;
  body: string;
  isFromAi: boolean;
  createdAtUtc: string;
}) {
  const isUser = senderRole === "Customer" || senderRole === "Visitor";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isFromAi
            ? "bg-emerald-50 text-emerald-950"
            : isUser
              ? "bg-stone-800 text-white"
              : "bg-stone-100 text-stone-900"
        }`}
      >
        <p className="mb-1 text-xs opacity-70">
          {senderRole} · {formatWhen(createdAtUtc)}
        </p>
        <p className="whitespace-pre-wrap">{body}</p>
      </div>
    </div>
  );
}

export function CommunicationThreadList({
  threads,
  loadThread,
  emptyMessage = "No communication threads yet.",
}: {
  threads: CommunicationThreadSummary[];
  loadThread: (id: string) => Promise<CommunicationThreadDetail>;
  emptyMessage?: string;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CommunicationThreadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchFn = useCallback(
    (thread: CommunicationThreadSummary, query: string) =>
      matchesSearch(
        query,
        thread.subject,
        thread.customerEmail,
        thread.customerId,
        thread.lastMessagePreview,
        thread.messageCount,
        formatWhen(thread.createdAtUtc)
      ),
    []
  );

  const controls = useAdminListControls(threads, searchFn, DEFAULT_ADMIN_TABLE_PAGE_SIZE);
  const visibleThreads = withPinnedItem(controls.pageItems, controls.filtered, expandedId);

  async function toggleThread(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(id);
    setLoading(true);
    setError(null);
    try {
      const thread = await loadThread(id);
      setDetail(thread);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load thread");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }

  if (threads.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">{emptyMessage}</p>;
  }

  return (
    <div className="mt-2 space-y-3">
      <AdminListToolbar
        controls={controls}
        placeholder="Search subject, customer, message preview…"
      />

      {visibleThreads.length === 0 ? (
        <p className="text-sm text-stone-500">No threads match your search.</p>
      ) : (
        <>
      <div className="space-y-3 md:hidden">
        {visibleThreads.map((t) => (
          <div key={t.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="font-medium text-gardens-dark">{t.subject}</p>
            <p className="mt-1 text-xs text-stone-500">{formatWhen(t.createdAtUtc)}</p>
            <p className="mt-2 text-sm text-stone-600">
              {t.customerEmail ?? (t.customerId ? t.customerId.slice(0, 8) : "Guest")}
            </p>
            <p className="mt-1 text-sm text-stone-500">
              {t.messageCount} message{t.messageCount === 1 ? "" : "s"}
            </p>
            {t.lastMessagePreview && (
              <p className="mt-2 line-clamp-2 text-sm text-stone-600">{t.lastMessagePreview}</p>
            )}
            <button
              type="button"
              onClick={() => toggleThread(t.id)}
              className="mt-3 text-sm font-medium text-emerald-700 underline hover:text-emerald-900"
            >
              {expandedId === t.id ? "Hide" : "View conversation"}
            </button>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Started</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Msgs</th>
              <th className="px-4 py-3 font-medium">Last message</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visibleThreads.map((t) => (
              <tr key={t.id} className="border-b last:border-0">
                <td className="px-4 py-3 text-stone-600">{formatWhen(t.createdAtUtc)}</td>
                <td className="px-4 py-3 font-medium">{t.subject}</td>
                <td className="px-4 py-3">
                  {t.customerEmail ?? (t.customerId ? t.customerId.slice(0, 8) : "Guest")}
                </td>
                <td className="px-4 py-3">{t.messageCount}</td>
                <td className="max-w-xs truncate px-4 py-3 text-stone-600">
                  {t.lastMessagePreview ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleThread(t.id)}
                    className="text-emerald-700 underline hover:text-emerald-900"
                  >
                    {expandedId === t.id ? "Hide" : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      {expandedId && (
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-4">
          {loading && <p className="text-sm text-stone-500">Loading messages…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {detail && !loading && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-stone-700">
                {detail.subject}
                {detail.customerEmail ? ` · ${detail.customerEmail}` : " · Guest"}
              </p>
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {detail.messages.map((m) => (
                  <MessageBubble
                    key={m.id}
                    senderRole={m.senderRole}
                    body={m.body}
                    isFromAi={m.isFromAi}
                    createdAtUtc={m.createdAtUtc}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
