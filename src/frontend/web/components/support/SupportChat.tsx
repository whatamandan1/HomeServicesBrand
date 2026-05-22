"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { api } from "@/lib/api";

const THREAD_KEY = "gardens-support-thread";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  body: string;
  escalated?: boolean;
};

export function SupportChat({ token }: { token: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(THREAD_KEY);
    if (saved) setThreadId(saved);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setError(null);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", body: text }]);
    setLoading(true);

    try {
      const r = await api.supportChat(token, text, threadId);
      if (!threadId) {
        setThreadId(r.threadId);
        localStorage.setItem(THREAD_KEY, r.threadId);
      }
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          body: r.reply,
          escalated: r.escalated,
        },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  function startNewChat() {
    localStorage.removeItem(THREAD_KEY);
    setThreadId(undefined);
    setMessages([]);
    setError(null);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft">
      <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-gardens-light/30 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gardens-dark">Support chat</p>
          <p className="text-xs text-stone-500">AI-powered · escalates to our team when needed</p>
        </div>
        {messages.length > 0 && (
          <button type="button" onClick={startNewChat} className="shrink-0 text-xs text-gardens-primary hover:underline">
            New chat
          </button>
        )}
      </div>

      <div className="flex h-64 flex-col gap-3 overflow-y-auto p-4 sm:h-72">
        {messages.length === 0 && !loading && (
          <p className="text-sm text-stone-500">
            Ask about your visits, plan, or availability — e.g. “When is my next visit?”
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-base sm:max-w-[85%] sm:text-sm ${
              m.role === "user"
                ? "ml-auto bg-gardens-primary text-white"
                : "bg-stone-100 text-stone-800"
            }`}
          >
            {m.body}
            {m.escalated && (
              <p className="mt-1 text-xs opacity-80">Escalated to our team — we&apos;ll follow up.</p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-4 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 border-t border-stone-100 p-3 safe-bottom">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          className="field-input mt-0 min-h-[48px] flex-1 py-2.5"
          placeholder="Type your message…"
          disabled={loading}
        />
        <button
          type="button"
          onClick={send}
          disabled={loading || !input.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gardens-primary text-white transition hover:bg-gardens-dark disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
