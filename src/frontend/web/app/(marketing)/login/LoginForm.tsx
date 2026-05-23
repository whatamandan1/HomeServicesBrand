"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { clearAuth, resolvePostLoginPath, saveAuth } from "@/lib/auth-storage";
import { api } from "@/lib/api";

const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "true";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAuth();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    clearAuth();
    const fd = new FormData(e.currentTarget);
    try {
      const auth = await api.login(
        String(fd.get("email")),
        String(fd.get("password"))
      );
      saveAuth(auth);
      const destination = resolvePostLoginPath(searchParams.get("next"), auth.role);
      window.location.assign(destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center py-8 md:py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
          <h1 className="font-display text-2xl font-bold text-gardens-dark">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-600">Log in to your GardensSorted account.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-stone-700">
              Email
              <input name="email" type="email" required autoComplete="email" className="field-input" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Password
              <input name="password" type="password" required autoComplete="current-password" className="field-input" />
            </label>
            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-gardens-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
          {showDemo && (
            <p className="mt-4 text-xs text-stone-400">
              Demo: admin@gardenssorted.local / Admin123! · provider@gardenssorted.local / Provider123!
            </p>
          )}
          <p className="mt-6 text-center text-sm text-stone-500">
            New customer?{" "}
            <Link href="/signup" className="font-medium text-gardens-primary hover:underline">
              Sign up
            </Link>
            {" · "}
            Gardener?{" "}
            <Link href="/providers#apply" className="font-medium text-gardens-primary hover:underline">
              Apply to join
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
