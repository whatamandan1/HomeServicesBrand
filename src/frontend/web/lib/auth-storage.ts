import type { AuthResponse } from "./api";

const KEY = "sorted_auth";

export function saveAuth(auth: AuthResponse) {
  if (typeof window !== "undefined")
    localStorage.setItem(KEY, JSON.stringify(auth));
}

export function loadAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window !== "undefined") localStorage.removeItem(KEY);
}
