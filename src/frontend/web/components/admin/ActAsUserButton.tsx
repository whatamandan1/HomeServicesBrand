"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, type AuthResponse } from "@/lib/api";
import { beginImpersonation, isImpersonating, portalPathForRole } from "@/lib/auth-storage";

export function ActAsUserButton({
  adminAuth,
  userId,
  label = "Act as user",
  className = "rounded-lg border border-gardens-primary/30 px-3 py-1.5 text-sm font-medium text-gardens-primary hover:bg-gardens-light/30 disabled:opacity-50",
  onError,
}: {
  adminAuth: AuthResponse;
  userId: string;
  label?: string;
  className?: string;
  onError?: (message: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (adminAuth.role !== "Admin" || isImpersonating(adminAuth)) return;
    setLoading(true);
    try {
      const target = await api.adminImpersonate(adminAuth.token, userId);
      beginImpersonation(adminAuth, target);
      router.push(portalPathForRole(target.role));
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "Could not act as user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" className={className} disabled={loading} onClick={handleClick}>
      {loading ? "Opening…" : label}
    </button>
  );
}
