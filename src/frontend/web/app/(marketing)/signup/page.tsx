"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { api, type SubscriptionPlan } from "@/lib/api";
import { formatGbp } from "@/lib/format";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";
import { saveAuth } from "@/lib/auth-storage";
import { compressImageFile } from "@/lib/compress-image";

const STEPS = ["Choose plan", "Your details", "Your garden"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [skipPayment, setSkipPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    gardenSize: "Small",
    availability: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);

  useEffect(() => {
    api.getPlans().then((p) => {
      const sorted = sortPlans(p);
      setPlans(sorted);
      const params = new URLSearchParams(window.location.search);
      const planIndex = params.get("plan");
      if (planIndex !== null && sorted[Number(planIndex)]) {
        setSelectedPlanId(sorted[Number(planIndex)].id);
      } else if (sorted[0]) {
        setSelectedPlanId(sorted[0].id);
      }
    }).catch(() => {
      setPlans(FALLBACK_PLANS);
      const params = new URLSearchParams(window.location.search);
      const planIndex = params.get("plan");
      const sorted = sortPlans(FALLBACK_PLANS);
      if (planIndex !== null && sorted[Number(planIndex)]) {
        setSelectedPlanId(sorted[Number(planIndex)].id);
      } else if (sorted[0]) {
        setSelectedPlanId(sorted[0].id);
      }
      setError(
        process.env.NODE_ENV === "development"
          ? "Could not load live plans — showing standard pricing. Signup may fail until the API is reachable."
          : "We're having trouble loading plans. Please refresh the page or try again in a moment."
      );
    });
    api.getPublicConfig().then((c) => setSkipPayment(c.bypassStripeCheckout)).catch(() => {});
  }, []);

  function updateField(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function canAdvance() {
    if (step === 0) return !!selectedPlanId;
    if (step === 1) {
      return form.firstName && form.lastName && form.email && form.password && form.phone && acceptedTerms;
    }
    return form.line1 && form.city && form.postcode && form.availability;
  }

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      if (selectedPlanId.startsWith("fallback-")) {
        throw new Error("Plans could not be loaded from the server. Refresh the page and try again.");
      }

      const auth = await api.registerCustomer({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        postcode: form.postcode,
        gardenSize: form.gardenSize,
        availabilityPreference: form.availability,
        subscriptionPlanId: selectedPlanId,
        acceptedTerms: true,
      });
      saveAuth(auth);

      const properties = await api.customerProperties(auth.token);
      const primary = properties.find((p) => p.isPrimary) ?? properties[0];
      if (primary && pendingPhotos.length > 0) {
        for (const photo of pendingPhotos.slice(0, 3)) {
          const compressed = await compressImageFile(photo);
          await api.customerUploadPropertyPhoto(auth.token, primary.id, compressed);
        }
      }

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
    <div className="pb-28 pt-8 md:pb-12 md:pt-12">
      <div className="mx-auto max-w-xl px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gardens-dark sm:text-3xl">Start your subscription</h1>
          <p className="mt-2 text-stone-600">Step {step + 1} of {STEPS.length} — {STEPS[step]}</p>
        </div>

        <div className="mt-6 flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={STEPS[i]}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-gardens-primary" : "bg-stone-200"}`}
            />
          ))}
        </div>

        {plans.length > 0 && plans[0]?.id.startsWith("fallback-") && (
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            {process.env.NODE_ENV === "development"
              ? "Live plans could not be loaded. Signup will work once the API connection is restored."
              : "We're having trouble loading the latest plans. Please refresh the page before continuing."}
          </p>
        )}

        {skipPayment && process.env.NODE_ENV === "development" && (
          <p className="mt-6 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Dev mode: payment skipped — subscription activates immediately.
          </p>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {step === 0 && (
          <div className="mt-8 space-y-3">
            {plans.map((p) => {
              const selected = selectedPlanId === p.id;
              const isMonthly = p.billingInterval === "Monthly";
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPlanId(p.id)}
                  className={`w-full rounded-2xl border p-5 text-left transition ${
                    selected
                      ? "border-gardens-primary bg-gardens-light/50 ring-2 ring-gardens-primary/30"
                      : "border-stone-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gardens-dark">{p.name}</p>
                      <p className="mt-1 text-2xl font-bold text-gardens-primary">
                        £{formatGbp(p.priceGbp)}
                        <span className="text-sm font-normal text-stone-500">/{isMonthly ? "mo" : "yr"}</span>
                      </p>
                    </div>
                    {selected && <Check className="h-5 w-5 shrink-0 text-gardens-primary" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={form.firstName} onChange={(v) => updateField("firstName", v)} required />
              <Field label="Last name" value={form.lastName} onChange={(v) => updateField("lastName", v)} required />
            </div>
            <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} required />
            <Field label="Password" type="password" value={form.password} onChange={(v) => updateField("password", v)} required />
            <Field label="Phone" type="tel" value={form.phone} onChange={(v) => updateField("phone", v)} required autoComplete="tel" />
            <label className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-gardens-primary focus:ring-gardens-primary"
                required
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-gardens-primary hover:underline" target="_blank">
                  terms of service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="font-medium text-gardens-primary hover:underline" target="_blank">
                  privacy policy
                </Link>
                .
              </span>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
            <Field label="Address line 1" value={form.line1} onChange={(v) => updateField("line1", v)} required autoComplete="address-line1" />
            <Field label="Address line 2" value={form.line2} onChange={(v) => updateField("line2", v)} autoComplete="address-line2" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City" value={form.city} onChange={(v) => updateField("city", v)} required autoComplete="address-level2" />
              <Field label="Postcode" value={form.postcode} onChange={(v) => updateField("postcode", v)} required autoComplete="postal-code" />
            </div>
            {process.env.NODE_ENV === "development" && (
              <p className="text-xs text-stone-400">
                Dev note: demo provider covers LS1, LS2, and WF1 for testing job claiming.
              </p>
            )}
            <label className="block text-sm font-medium text-stone-700">
              Garden size
              <select
                value={form.gardenSize}
                onChange={(e) => updateField("gardenSize", e.target.value)}
                className="field-input"
                required
              >
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </label>
            <Field
              label="Preferred availability (e.g. Weekday mornings)"
              value={form.availability}
              onChange={(v) => updateField("availability", v)}
              required
            />
            <div className="space-y-3 border-t border-stone-100 pt-4">
              <div>
                <p className="text-sm font-medium text-stone-700">Garden photos (optional)</p>
                <p className="text-xs text-stone-500">Add up to 3 photos now, or upload later from your account.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {pendingPhotos.map((photo, index) => (
                  <div key={`${photo.name}-${index}`} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-600">
                    {photo.name}
                    <button
                      type="button"
                      className="ml-2 text-red-600 hover:underline"
                      onClick={() => setPendingPhotos((files) => files.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {pendingPhotos.length < 3 && (
                  <label className="inline-flex cursor-pointer items-center rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50">
                    Add photo
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        if (file) setPendingPhotos((files) => [...files, file].slice(0, 3));
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-full border border-stone-200 px-6 text-base font-medium text-stone-700"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              disabled={!canAdvance()}
              onClick={() => setStep((s) => s + 1)}
              className="btn-primary gap-1 sm:ml-auto"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading || !canAdvance()}
              onClick={submit}
              className="btn-primary sm:ml-auto"
            >
              {loading ? "Creating account…" : skipPayment ? "Create account" : "Continue to payment"}
            </button>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gardens-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete={autoComplete}
        className="field-input"
      />
    </label>
  );
}
