"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearAuth, saveAuth } from "@/lib/auth-storage";
import { api } from "@/lib/api";

const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO_LOGIN === "true";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearAuth();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const auth = await api.login(
        String(fd.get("email")),
        String(fd.get("password"))
      );
      saveAuth(auth);
      if (auth.role === "Admin") router.push("/admin");
      else if (auth.role === "Provider") router.push("/provider");
      else router.push("/portal");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center py-12">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-soft">
          <h1 className="font-display text-2xl font-bold text-gardens-dark">Welcome back</h1>
          <p className="mt-2 text-sm text-stone-600">Log in to your GardensSorted account.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm font-medium text-stone-700">
              Email
              <input
                name="email"
                type="email"
                required
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-gardens-primary"
              />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Password
              <input
                name="password"
                type="password"
                required
                className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-gardens-primary"
              />
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-gardens-primary py-3 text-sm font-semibold text-white hover:bg-gardens-dark disabled:opacity-50"
            >
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
          </p>
        </div>
      </div>
    </div>
  );
}
