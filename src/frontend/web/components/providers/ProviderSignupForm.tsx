"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth-storage";
import {
  PROVIDER_EQUIPMENT_NOTE,
  PROVIDER_ADDON_EQUIPMENT_SUMMARY,
  PROVIDER_EQUIPMENT_SUMMARY,
  PROVIDER_VETTING_SUMMARY,
} from "@/lib/provider-requirements";

export function ProviderSignupForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(10);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const coveragePostcode = String(fd.get("coveragePostcode") ?? "").trim();

    if (!coveragePostcode) {
      setError("Enter your base postcode.");
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
        coveragePostcode,
        coverageRadiusMiles: radius,
      });
      saveAuth(auth);
      router.push("/provider");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        setError(
          "Signup timed out. Your account may have been created - try logging in, or submit again with a new email."
        );
      } else {
        setError(err instanceof Error ? err.message : "Registration failed");
      }
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
        <p className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3 text-xs text-stone-600">
          <span className="font-medium text-stone-800">After signup:</span> {PROVIDER_VETTING_SUMMARY} Complete the form in
          your provider portal.
        </p>
        <p className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
          <span className="font-medium text-stone-800">Equipment:</span> {PROVIDER_EQUIPMENT_SUMMARY}{" "}
          {PROVIDER_EQUIPMENT_NOTE}
        </p>
        <p className="mt-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-xs text-stone-600">
          <span className="font-medium text-stone-800">Add-on visits:</span> {PROVIDER_ADDON_EQUIPMENT_SUMMARY}
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
            Base postcode
            <input
              name="coveragePostcode"
              required
              placeholder="LS1 4AP"
              autoComplete="postal-code"
              className="field-input"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700">
            Coverage radius: {radius} miles
            <input
              name="coverageRadiusMiles"
              type="range"
              min={1}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="mt-2 w-full accent-gardens-primary"
            />
          </label>
          <p className="text-xs text-stone-500">
            Jobs in postcode areas within this distance of your base postcode will appear in your open visits list.
            Areas that partially overlap your radius are included.
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
