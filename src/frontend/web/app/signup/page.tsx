"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type SubscriptionPlan } from "@/lib/api";
import { saveAuth } from "@/lib/auth-storage";

export default function SignupPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getPlans().then(setPlans).catch((e) => setError(e.message));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    try {
      const auth = await api.registerCustomer({
        email: fd.get("email"),
        password: fd.get("password"),
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        phone: fd.get("phone"),
        line1: fd.get("line1"),
        line2: fd.get("line2") || null,
        city: fd.get("city"),
        postcode: fd.get("postcode"),
        gardenSize: fd.get("gardenSize"),
        subscriptionPlanId: fd.get("planId"),
        availabilityPreference: fd.get("availability"),
      });
      saveAuth(auth);
      const subId = auth.pendingSubscriptionId;
      if (!subId) throw new Error("No subscription created");

      const checkout = await api.checkout(subId, auth.token);
      window.location.href = checkout.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gardens-primary">Sign up</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="First name" name="firstName" required />
        <Field label="Last name" name="lastName" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Field label="Phone" name="phone" required />
        <Field label="Address line 1" name="line1" required />
        <Field label="Address line 2" name="line2" />
        <Field label="City" name="city" required />
        <Field label="Postcode" name="postcode" required />
        <label className="block text-sm">
          Garden size
          <select name="gardenSize" className="mt-1 w-full rounded border px-3 py-2" required>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
        </label>
        <label className="block text-sm">
          Plan
          <select name="planId" className="mt-1 w-full rounded border px-3 py-2" required>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — £{p.priceGbp}/{p.billingInterval === "Monthly" ? "mo" : "yr"}
              </option>
            ))}
          </select>
        </label>
        <Field
          label="Availability (e.g. Weekday mornings)"
          name="availability"
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading || plans.length === 0}
          className="w-full rounded-lg bg-gardens-primary py-3 text-white disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Continue to payment"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1 w-full rounded border px-3 py-2"
      />
    </label>
  );
}
