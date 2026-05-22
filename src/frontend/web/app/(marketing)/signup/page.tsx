"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { api, type SubscriptionPlan } from "@/lib/api";
import { saveAuth } from "@/lib/auth-storage";

export default function SignupPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [skipPayment, setSkipPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getPlans().then((p) => {
      setPlans(p);
      const params = new URLSearchParams(window.location.search);
      const planIndex = params.get("plan");
      if (planIndex !== null && p[Number(planIndex)]) {
        setSelectedPlanId(p[Number(planIndex)].id);
      } else if (p[0]) {
        setSelectedPlanId(p[0].id);
      }
    }).catch((e) => setError(e.message));
    api.getPublicConfig().then((c) => setSkipPayment(c.bypassStripeCheckout)).catch(() => {});
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
        subscriptionPlanId: selectedPlanId,
        availabilityPreference: fd.get("availability"),
      });
      saveAuth(auth);
      const subId = auth.pendingSubscriptionId;
      if (!subId) throw new Error("No subscription created");

      if (skipPayment) {
        await api.devActivate(subId);
        router.push("/portal");
        return;
      }

      const checkout = await api.checkout(subId, auth.token);
      window.location.href = checkout.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="py-12">
      <div className="mx-auto max-w-xl px-4">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-gardens-dark">Start your subscription</h1>
          <p className="mt-2 text-stone-600">A few details and you&apos;re sorted.</p>
        </div>

        {skipPayment && process.env.NODE_ENV === "development" && (
          <p className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Dev mode: payment skipped — subscription activates immediately.
          </p>
        )}

        {plans.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {plans.map((p) => {
              const selected = selectedPlanId === p.id;
              const isMonthly = p.billingInterval === "Monthly";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    selected
                      ? "border-gardens-primary bg-gardens-light/50 ring-2 ring-gardens-primary/30"
                      : "border-stone-200 bg-white hover:border-gardens-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gardens-dark">{p.name}</p>
                      <p className="mt-1 text-2xl font-bold text-gardens-primary">
                        £{p.priceGbp}
                        <span className="text-sm font-normal text-stone-500">/{isMonthly ? "mo" : "yr"}</span>
                      </p>
                    </div>
                    {selected && <Check className="h-5 w-5 text-gardens-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" name="firstName" required />
            <Field label="Last name" name="lastName" required />
          </div>
          <Field label="Email" name="email" type="email" required />
          <Field label="Password" name="password" type="password" required />
          <Field label="Phone" name="phone" required />
          <Field label="Address line 1" name="line1" required />
          <Field label="Address line 2" name="line2" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" name="city" required />
            <Field label="Postcode" name="postcode" required />
          </div>
          <label className="block text-sm font-medium text-stone-700">
            Garden size
            <select name="gardenSize" className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-gardens-primary" required>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </label>
          <Field label="Preferred availability (e.g. Weekday mornings)" name="availability" required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading || !selectedPlanId}
            className="w-full rounded-full bg-gardens-primary py-3.5 text-sm font-semibold text-white transition hover:bg-gardens-dark disabled:opacity-50"
          >
            {loading ? "Creating account…" : skipPayment ? "Create account" : "Continue to payment"}
          </button>
          <p className="text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gardens-primary hover:underline">
              Log in
            </Link>
          </p>
        </form>
      </div>
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
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-1.5 w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-gardens-primary focus:ring-1 focus:ring-gardens-primary"
      />
    </label>
  );
}
