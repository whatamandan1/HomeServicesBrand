"use client";

import dynamic from "next/dynamic";

const GuestChatWidget = dynamic(
  () => import("@/components/support/SupportChat").then((m) => m.GuestChatWidget),
  { ssr: false, loading: () => null }
);

export function LazyGuestChat() {
  if (process.env.NEXT_PUBLIC_E2E === "true") return null;
  return <GuestChatWidget />;
}
