"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { api } from "@/lib/api";
import { guestChatFabClosedClass, guestChatPanelClass } from "@/lib/mobile-chrome";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  body: string;
  escalated?: boolean;
};

type SupportChatProps = {
  mode: "guest" | "customer";
  token?: string;
  storageKey?: string;
  title?: string;
  subtitle?: string;
  emptyHint?: string;
  className?: string;
  hideHeader?: boolean;
  compact?: boolean;
  promptSeed?: { key: number; text: string } | null;
};

export function SupportChat({
  mode,
  token,
  storageKey,
  title = "Support chat",
  subtitle = "AI-powered · escalates to our team when needed",
  emptyHint,
  className = "",
  hideHeader = false,
  compact = false,
  promptSeed = null,
}: SupportChatProps) {
  const threadStorageKey = storageKey ?? (mode === "guest" ? "gardens-guest-thread" : "gardens-support-thread");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultEmptyHint =
    mode === "guest"
      ? "Ask about pricing, how it works, or whether we cover your area - no signup needed."
      : "Ask about your visits, plan, or availability - e.g. “When is my next visit?”";

  useEffect(() => {
    const saved = localStorage.getItem(threadStorageKey);
    if (saved) setThreadId(saved);
  }, [threadStorageKey]);

  useEffect(() => {
    if (!promptSeed) return;
    setInput(promptSeed.text);
  }, [promptSeed?.key, promptSeed?.text]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    if (mode === "customer" && !token) {
      setError("Please log in to use support chat.");
      return;
    }

    setInput("");
    setError(null);
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", body: text }]);
    setLoading(true);

    try {
      const r =
        mode === "guest"
          ? await api.guestSupportChat(text, threadId)
          : await api.supportChat(token!, text, threadId);

      if (!threadId) {
        setThreadId(r.threadId);
        localStorage.setItem(threadStorageKey, r.threadId);
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
    localStorage.removeItem(threadStorageKey);
    setThreadId(undefined);
    setMessages([]);
    setError(null);
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-soft ${className}`}>
      {!hideHeader && (
        <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-gardens-light/30 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gardens-dark">{title}</p>
            <p className="text-xs text-stone-500">{subtitle}</p>
          </div>
          {messages.length > 0 && (
            <button type="button" onClick={startNewChat} className="shrink-0 text-xs text-gardens-primary hover:underline">
              New chat
            </button>
          )}
        </div>
      )}

      <div
        ref={scrollRef}
        className={`flex flex-col gap-3 overflow-y-auto p-4 ${compact ? "h-56 sm:h-64" : "h-64 sm:h-80"}`}
      >
        {messages.length === 0 && !loading && (
          <p className="text-sm text-stone-500">{emptyHint ?? defaultEmptyHint}</p>
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
              <p className="mt-1 text-xs font-medium opacity-90">Escalated - our team will follow up shortly.</p>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}
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

      {mode === "guest" && (
        <p className="border-t border-stone-100 px-4 py-2 text-center text-xs text-stone-500">
          Ready to subscribe?{" "}
          <Link href="/signup" className="font-medium text-gardens-primary hover:underline">
            Sign up free
          </Link>
        </p>
      )}
    </div>
  );
}

export function CustomerChatWidget({
  token,
  promptSeed = null,
}: {
  token: string;
  promptSeed?: { key: number; text: string } | null;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    if (!promptSeed) return;
    setOpen(true);
  }, [promptSeed?.key]);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#chat") return;
    setOpen(true);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  function resetChat() {
    localStorage.removeItem("gardens-support-thread");
    setSession((s) => s + 1);
  }

  const fabPosition = "fixed right-4 z-50 bottom-20 md:bottom-6";

  return (
    <>
      {open && (
        <div
          className={`${fabPosition} flex w-[min(calc(100vw-2rem),380px)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl`}
          role="dialog"
          aria-label="Customer service chat"
        >
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-gardens-light/30 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gardens-dark">Customer service</p>
              <p className="text-xs text-stone-500">Ask about your plan, visits, or billing</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-lg px-2 py-1 text-xs text-gardens-primary hover:bg-gardens-light/50 hover:underline"
              >
                New chat
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <SupportChat
            key={session}
            mode="customer"
            token={token}
            hideHeader
            compact
            promptSeed={promptSeed}
            className="rounded-none border-0 shadow-none"
          />
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${fabPosition} flex min-h-[48px] items-center gap-2 rounded-full bg-gardens-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gardens-dark`}
          aria-label="Open customer service chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Customer service</span>
        </button>
      )}
    </>
  );
}

export function GuestChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#chat") return;
    setOpen(true);
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  function resetChat() {
    localStorage.removeItem("gardens-guest-thread");
    setSession((s) => s + 1);
  }

  const fabClosedClass = guestChatFabClosedClass(pathname);
  const panelClass = guestChatPanelClass();

  return (
    <>
      {open && (
        <div
          className={`${panelClass} flex w-[min(calc(100vw-2rem),380px)] max-md:w-auto flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl max-md:max-h-[min(70dvh,32rem)]`}
          role="dialog"
          aria-label="Live chat"
        >
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 bg-gardens-light/30 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gardens-dark">Questions?</p>
              <p className="text-xs text-stone-500">We typically reply instantly</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={resetChat}
                className="rounded-lg px-2 py-1 text-xs text-gardens-primary hover:bg-gardens-light/50 hover:underline"
              >
                New chat
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 transition hover:bg-stone-100 hover:text-stone-800"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <SupportChat
            key={session}
            mode="guest"
            hideHeader
            compact
            className="rounded-none border-0 shadow-none"
          />
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`${fabClosedClass} flex min-h-[48px] items-center gap-2 rounded-full bg-gardens-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-gardens-dark ${pathname === "/signup" ? "max-md:hidden" : ""}`}
          aria-label="Open live chat"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="hidden sm:inline">Chat with us</span>
        </button>
      )}
    </>
  );
}
