"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth-storage";

function parsePostcodeSectors(input: string): string[] {
  const sectors = input
    .split(/[\n,;]+/)
    .map((s) => s.trim().toUpperCase().replace(/\s+/g, ""))
    .filter(Boolean)
    .map((s) => (s.length >= 3 ? s.slice(0, 3) : s));

  return [...new Set(sectors)];
}

export function ProviderSignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const sectors = parsePostcodeSectors(String(fd.get("sectors") ?? ""));

    if (sectors.length === 0) {
      setError("Enter at least one postcode sector (e.g. LS1, LS2).");
      setLoading(false);
      return;
    }

    try {
      const auth = await api.registerProvider({
        firstName: String(fd.get("firstName")),
        lastName: String(fd.get("lastName")),
        email: String(fd.get("email")),
        password: String(fd.get("password")),
        phone: String(fd.get("phone")),
        postcodeSectors: sectors,
      });
      saveAuth(auth);
      router.push("/provider");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="apply" className="scroll-mt-6 pb-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-gardens-primary/20 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-gardens-dark">Apply to join</h2>
        <p className="mt-2 text-sm text-stone-600">
          Create your provider account. An admin will review and approve you before you can claim jobs.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700">
              First name
              <input name="firstName" required autoComplete="given-name" className="field-input" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Last name
              <input name="lastName" required autoComplete="family-name" className="field-input" />
            </label>
          </div>
          <label className="block text-sm font-medium text-stone-700">
            Email
            <input name="email" type="email" required autoComplete="email" className="field-input" />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Password
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className="field-input" />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Phone
            <input name="phone" type="tel" required autoComplete="tel" className="field-input" />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Postcode sectors you cover
            <textarea
              name="sectors"
              required
              rows={3}
              placeholder="LS1, LS2, WF1"
              className="field-input resize-y"
            />
          </label>
          <p className="text-xs text-stone-500">
            Use Yorkshire outward codes (first part of postcode), separated by commas — e.g. LS1, LS2, WF1.
          </p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Submitting…" : "Submit application"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already approved?{" "}
          <Link href="/login" className="font-medium text-gardens-primary hover:underline">
            Provider login
          </Link>
        </p>
      </div>
    </section>
  );
}
