"use client";

import { useEffect, useState } from "react";
import { api, type CustomerSubscription, type JobVisit } from "@/lib/api";
import { clearAuth } from "@/lib/auth-storage";
import { useAuth } from "@/lib/use-auth";
import { DataTable, StatusBadge } from "@/components/ui";

export default function PortalPage() {
  const { auth, setAuth, ready } = useAuth();
  const [subs, setSubs] = useState<CustomerSubscription[]>([]);
  const [visits, setVisits] = useState<JobVisit[]>([]);
  const [chat, setChat] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.token || auth.role !== "Customer") return;
    api.customerSubscriptions(auth.token).then(setSubs);
    api.customerVisits(auth.token).then(setVisits);
  }, [auth]);

  if (!ready) return <p className="text-stone-500">Loading…</p>;
  if (!auth) {
    return (
      <p>
        Please <a href="/login" className="text-gardens-primary underline">login</a> as a customer.
      </p>
    );
  }
  if (auth.role !== "Customer") {
    return (
      <p>
        You are logged in as <strong>{auth.role}</strong>.{" "}
        <a href="/login" className="underline">Sign in</a> as a customer.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">My account</h1>
          <p className="text-sm text-stone-500">{auth.email}</p>
        </div>
        <button
          onClick={() => {
            clearAuth();
            setAuth(null);
          }}
          className="text-sm text-stone-500 hover:text-stone-800"
        >
          Logout
        </button>
      </div>

      <section>
        <h2 className="font-semibold">Subscriptions</h2>
        {subs.length === 0 ? (
          <p className="mt-2 text-sm text-stone-500">No subscriptions yet.</p>
        ) : (
          <ul className="mt-2 space-y-3">
            {subs.map((s) => (
              <li key={s.id} className="rounded-lg border bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{s.planName}</span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-1 text-sm text-stone-600">
                  Availability: {s.availabilityPreference}
                </p>
                {s.startedAtUtc && (
                  <p className="text-xs text-stone-400">
                    Since {new Date(s.startedAtUtc).toLocaleDateString("en-GB")}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold">Upcoming visits</h2>
        <DataTable
          columns={[
            { key: "date", label: "Date" },
            { key: "postcode", label: "Postcode" },
            { key: "window", label: "Window" },
            { key: "status", label: "Status" },
            { key: "provider", label: "Gardener" },
          ]}
          rows={visits.map((v) => ({
            date: v.scheduledDate.slice(0, 10),
            postcode: v.postcode,
            window: v.availabilityWindow,
            status: v.status,
            provider: v.assignedProviderName ?? "To be assigned",
          }))}
          emptyMessage="No visits scheduled yet."
        />
      </section>

      <section>
        <h2 className="font-semibold">Support chat</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={chat}
            onChange={(e) => setChat(e.target.value)}
            className="flex-1 rounded border px-3 py-2"
            placeholder="Ask about your visits or plan…"
          />
          <button
            className="rounded bg-gardens-primary px-4 text-white disabled:opacity-50"
            disabled={!chat.trim()}
            onClick={async () => {
              setChatError(null);
              try {
                const r = await api.supportChat(auth.token, chat);
                setReply(r.reply + (r.escalated ? " (escalated to our team)" : ""));
                setChat("");
              } catch (e) {
                setChatError(e instanceof Error ? e.message : "Chat failed");
              }
            }}
          >
            Send
          </button>
        </div>
        {chatError && <p className="mt-2 text-sm text-red-600">{chatError}</p>}
        {reply && (
          <p className="mt-2 rounded-lg bg-gardens-accent/30 p-4 text-sm">{reply}</p>
        )}
      </section>
    </div>
  );
}
