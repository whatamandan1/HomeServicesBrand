import type { AuthResponse } from "./api";

const KEY = "sorted_auth";
const ADMIN_BACKUP_KEY = "sorted_auth_admin";
const SESSION_COOKIE = "sorted_session";
const SESSION_ROLE_COOKIE = "sorted_role";

function cookieSecure() {
  return typeof window !== "undefined" && window.location.protocol === "https:";
}

export function isAuthExpired(auth: AuthResponse) {
  return new Date(auth.expiresAtUtc).getTime() <= Date.now();
}

export function saveAuth(auth: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(auth));
  const maxAge = Math.max(
    60,
    Math.floor((new Date(auth.expiresAtUtc).getTime() - Date.now()) / 1000)
  );
  const secure = cookieSecure() ? "; Secure" : "";
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
  document.cookie = `${SESSION_ROLE_COOKIE}=${encodeURIComponent(auth.role)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function loadAuth(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    const auth = JSON.parse(raw) as AuthResponse;
    if (isAuthExpired(auth)) {
      clearAuth();
      return null;
    }
    return auth;
  } catch {
    return null;
  }
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
  localStorage.removeItem(ADMIN_BACKUP_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
  document.cookie = `${SESSION_ROLE_COOKIE}=; path=/; max-age=0`;
}

export function isImpersonating(auth: AuthResponse | null) {
  return !!auth?.impersonatorUserId;
}

export function beginImpersonation(adminAuth: AuthResponse, impersonatedAuth: AuthResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_BACKUP_KEY, JSON.stringify(adminAuth));
  saveAuth(impersonatedAuth);
}

export function exitImpersonation(): AuthResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(ADMIN_BACKUP_KEY);
  if (!raw) return null;
  localStorage.removeItem(ADMIN_BACKUP_KEY);
  try {
    const admin = JSON.parse(raw) as AuthResponse;
    if (isAuthExpired(admin)) {
      clearAuth();
      return null;
    }
    saveAuth(admin);
    return admin;
  } catch {
    return null;
  }
}

export function portalPathForRole(role: AuthResponse["role"]) {
  if (role === "Admin") return "/admin";
  if (role === "Provider") return "/provider";
  return "/portal";
}
