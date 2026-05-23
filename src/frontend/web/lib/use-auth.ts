"use client";

import { useEffect, useState } from "react";
import type { AuthResponse } from "./api";
import { loadAuth, syncSessionCookies } from "./auth-storage";

/** Load auth from localStorage after mount to avoid SSR hydration mismatch. */
export function useAuth() {
  const [auth, setAuth] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = loadAuth();
    if (stored) syncSessionCookies(stored);
    setAuth(stored);
    setReady(true);
  }, []);

  return { auth, setAuth, ready };
}
