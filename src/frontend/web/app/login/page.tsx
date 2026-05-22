"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { clearAuth, saveAuth } from "@/lib/auth-storage";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    clearAuth();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
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
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-gardens-primary">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input name="email" type="email" placeholder="Email" required className="w-full rounded border px-3 py-2" />
        <input name="password" type="password" placeholder="Password" required className="w-full rounded border px-3 py-2" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-gardens-primary py-3 text-white">
          Sign in
        </button>
      </form>
      <p className="mt-4 text-sm text-stone-500">
        Demo: admin@gardenssorted.local / Admin123! · provider@gardenssorted.local / Provider123!
      </p>
    </div>
  );
}
