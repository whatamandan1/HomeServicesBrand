"use client";

import { useRouter } from "next/navigation";
import { exitImpersonation, isImpersonating, portalPathForRole } from "@/lib/auth-storage";
import { useAuth } from "@/lib/use-auth";

export function ImpersonationBanner() {
  const router = useRouter();
  const { auth, setAuth, ready } = useAuth();

  if (!ready || !auth || !isImpersonating(auth)) return null;

  function handleExit() {
    const admin = exitImpersonation();
    if (!admin) {
      setAuth(null);
      router.push("/login");
      return;
    }
    setAuth(admin);
    router.push(portalPathForRole(admin.role));
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <p>
          Acting as <strong>{auth.email}</strong>
          {auth.impersonatorEmail ? (
            <span className="text-amber-800"> · Admin: {auth.impersonatorEmail}</span>
          ) : null}
        </p>
        <button
          type="button"
          onClick={handleExit}
          className="rounded-lg bg-amber-900 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-950"
        >
          Exit to admin
        </button>
      </div>
    </div>
  );
}
