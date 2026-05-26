"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { api, type AuthResponse, type GardenSize, type SubscriptionPlan } from "@/lib/api";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";
import {
  findTierPlanForBilling,
  formatPriceFrom,
  GARDEN_SIZE_GUIDE,
  planFeatures,
  planPriceForGarden,
  planVisitSummary,
  PLAN_TIERS,
  type BillingChoice,
  type PlanTier,
} from "@/lib/consumer-plans";
import { saveAuth } from "@/lib/auth-storage";
import { stashSignupPhotos } from "@/lib/pending-signup-photos";
import { compressImageFile } from "@/lib/compress-image";
import {
  isValidEmail,
  isValidUkPostcode,
  MIN_PASSWORD_LENGTH,
  normalizeUkPostcode,
  tierFromPlan,
} from "@/lib/signup-utils";
import { useSignupLeadCapture } from "@/lib/use-signup-lead";
import { AlertBanner, LoadingSpinner } from "@/components/ui/feedback";
import { AvailabilityPicker } from "@/components/signup/AvailabilityPicker";
import { SignupSummary } from "@/components/signup/SignupSummary";

const STEPS = ["Get started", "Choose plan", "Finish signup"] as const;

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [billing, setBilling] = useState<BillingChoice>("Annual");
  const [selectedTier, setSelectedTier] = useState<PlanTier>("essential");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [skipPayment, setSkipPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepHint, setStepHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    line1: "",
    line2: "",
    city: "",
    postcode: "",
    gardenSize: "Small" as GardenSize,
    availability: "",
  });
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([]);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const urls = pendingPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingPhotos]);

  function applyPlans(sorted: SubscriptionPlan[]) {
    setPlans(sorted);
    const params = new URLSearchParams(window.location.search);
    const planIndex = params.get("plan");
    if (planIndex !== null && sorted[Number(planIndex)]) {
      const fromUrl = sorted[Number(planIndex)];
      const tier = tierFromPlan(fromUrl);
      setSelectedTier(tier);
      setBilling("Annual");
      const annualPlan = findTierPlanForBilling(sorted, tier, "Annual");
      setSelectedPlanId(annualPlan?.id ?? fromUrl.id);
    } else {
      const defaultPlan = findTierPlanForBilling(sorted, selectedTier, billing) ?? sorted[0];
      if (defaultPlan) setSelectedPlanId(defaultPlan.id);
    }
  }

  useEffect(() => {
    setPlansLoading(true);
    api
      .getPlans()
      .then((p) => applyPlans(sortPlans(p)))
      .catch(() => {
        applyPlans(sortPlans(FALLBACK_PLANS));
        setError(
          process.env.NODE_ENV === "development"
            ? "Could not load live plans — showing standard pricing. Signup may fail until the API is reachable."
            : "We're having trouble loading plans. Please refresh the page or try again in a moment."
        );
      })
      .finally(() => setPlansLoading(false));
    api.getPublicConfig().then((c) => setSkipPayment(c.bypassStripeCheckout)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (plans.length === 0) return;
    const plan = findTierPlanForBilling(plans, selectedTier, billing);
    if (plan) setSelectedPlanId(plan.id);
  }, [billing, selectedTier, plans]);

  useLayoutEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  function updateField(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    setStepHint(null);
  }

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const leadSnapshot = useMemo(
    () => ({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      lastStep: step,
      selectedPlanName: selectedPlan?.name,
      gardenSize: form.gardenSize,
      postcode: form.postcode ? normalizeUkPostcode(form.postcode) : undefined,
    }),
    [form, step, selectedPlan?.name]
  );

  const { captureLead } = useSignupLeadCapture(leadSnapshot);

  function stepValidationMessage(): string | null {
    if (step === 0) {
      if (!form.firstName.trim()) return "Enter your first name.";
      if (!form.lastName.trim()) return "Enter your last name.";
      if (!isValidEmail(form.email)) return "Enter a valid email address.";
      return null;
    }
    if (step === 1) {
      if (!selectedPlanId) return "Select a plan to continue.";
      return null;
    }
    if (!form.line1.trim() || !form.city.trim()) return "Enter your address and city.";
    if (!isValidUkPostcode(form.postcode)) return "Enter a valid UK postcode (e.g. LS1 4AP).";
    if (!form.availability.trim()) return "Tell us when visits work best for you.";
    if (form.password.length < MIN_PASSWORD_LENGTH) {
      return `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    return null;
  }

  function canAdvance() {
    return stepValidationMessage() === null;
  }

  async function tryAdvance() {
    const message = stepValidationMessage();
    if (message) {
      setStepHint(message);
      return;
    }
    setStepHint(null);
    if (step <= 1) await captureLead();
    (document.activeElement as HTMLElement | null)?.blur?.();
    setStep((s) => s + 1);
  }

  async function continueToPayment(auth: AuthResponse) {
    let subId = auth.pendingSubscriptionId ?? null;
    if (!subId) {
      const subs = await api.customerSubscriptions(auth.token);
      subId = subs.find((s) => s.status === "PendingPayment")?.id ?? null;
    }
    if (!subId) throw new Error("No subscription awaiting payment on this account.");

    if (skipPayment) {
      try {
        if (pendingPhotos.length > 0) await stashSignupPhotos(pendingPhotos);
      } catch {
        // Photos can be added in the portal after signup.
      }
      await api.devActivate(subId);
      router.push("/portal");
      return;
    }

    const checkout = await api.checkout(subId, auth.token);
    try {
      if (pendingPhotos.length > 0) await stashSignupPhotos(pendingPhotos);
    } catch {
      // Photos can be added in the portal after payment.
    }
    window.location.href = checkout.url;
  }

  async function submit() {
    const message = stepValidationMessage();
    if (message) {
      setStepHint(message);
      return;
    }

    setLoading(true);
    setError(null);
    setStepHint(null);
    try {
      if (selectedPlanId.startsWith("fallback-")) {
        throw new Error("Plans could not be loaded from the server. Refresh the page and try again.");
      }

      await captureLead();

      const auth = await api.registerCustomer({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: "",
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        postcode: normalizeUkPostcode(form.postcode),
        gardenSize: form.gardenSize,
        availabilityPreference: form.availability.trim(),
        subscriptionPlanId: selectedPlanId,
        acceptedTerms: true,
      });
      saveAuth(auth);
      await continueToPayment(auth);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      const shouldRetryLogin =
        /already registered/i.test(msg) || /server took too long/i.test(msg);

      if (shouldRetryLogin) {
        try {
          const auth = await api.login(form.email, form.password);
          saveAuth(auth);
          await continueToPayment(auth);
          return;
        } catch (retryErr) {
          if (/already registered/i.test(msg)) {
            setError(
              "This email is already registered. Log in with your password to continue to payment."
            );
          } else {
            const retryMessage =
              retryErr instanceof Error ? retryErr.message : "Could not continue checkout.";
            setError(
              retryMessage === msg
                ? `${msg} Try logging in to continue checkout.`
                : retryMessage
            );
          }
          return;
        }
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const usingFallback = plans.length > 0 && plans[0]?.id.startsWith("fallback-");
  const visibleTiers = useMemo(
    () =>
      PLAN_TIERS.map((tier) => ({
        ...tier,
        plan: findTierPlanForBilling(plans, tier.id, billing),
      })).filter((t) => t.plan),
    [plans, billing]
  );

  return (
    <div className="pb-32 pt-8 md:pb-12 md:pt-12">
      <div ref={topRef} className="mx-auto max-w-5xl scroll-mt-8 px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gardens-dark sm:text-3xl">
            Start your subscription
          </h1>
          <p className="mt-2 text-stone-600">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        <div className="mt-6 flex gap-2" aria-hidden>
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full ${i <= step ? "bg-gardens-primary" : "bg-stone-200"}`}
              />
              <p className="mt-1 hidden text-center text-xs text-stone-500 sm:block">{label}</p>
            </div>
          ))}
        </div>

        {usingFallback && (
          <AlertBanner
            variant="warning"
            message={
              process.env.NODE_ENV === "development"
                ? "Live plans could not be loaded. Signup will work once the API connection is restored."
                : "We're having trouble loading the latest plans. Please refresh the page before continuing."
            }
            className="mt-6"
          />
        )}

        {skipPayment && process.env.NODE_ENV === "development" && (
          <AlertBanner
            variant="warning"
            message="Dev mode: payment skipped — subscription activates immediately."
            className="mt-6"
          />
        )}

        {error && (
          <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} className="mt-6" />
        )}

        <div className={`mt-8 ${step >= 1 && selectedPlan ? "lg:grid lg:grid-cols-[1fr_280px] lg:gap-8" : ""}`}>
          <div>
            {step === 0 && (
              <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
                <p className="text-sm text-stone-600">
                  Start here — we&apos;ll save your progress so we can help if you need to finish later.
                </p>
                <Field label="First name" value={form.firstName} onChange={(v) => updateField("firstName", v)} required autoComplete="given-name" />
                <Field label="Last name" value={form.lastName} onChange={(v) => updateField("lastName", v)} required autoComplete="family-name" />
                <Field label="Email" type="email" value={form.email} onChange={(v) => updateField("email", v)} required autoComplete="email" />
                <p className="text-xs text-stone-500">
                  By continuing, you agree we may contact you by email about your signup and account. Marketing
                  emails are optional and you can opt out anytime.
                </p>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                {plansLoading ? (
                  <div className="space-y-4" aria-busy="true">
                    <div className="h-10 animate-pulse rounded-xl bg-stone-200" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-stone-200" />
                      ))}
                    </div>
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="h-36 animate-pulse rounded-2xl bg-stone-200" />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex rounded-full border border-stone-200 bg-white p-1">
                        {(["Annual", "Monthly"] as const).map((choice) => (
                          <button
                            key={choice}
                            type="button"
                            onClick={() => setBilling(choice)}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                              billing === choice
                                ? "bg-gardens-primary text-white"
                                : "text-stone-600 hover:text-gardens-dark"
                            }`}
                          >
                            {choice}
                            {choice === "Annual" && (
                              <span className="ml-1.5 text-xs opacity-90">Save ~2 months</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <Link href="/#pricing" className="text-sm font-medium text-gardens-primary hover:underline">
                        Compare all features
                      </Link>
                    </div>

                    <fieldset>
                      <legend className="text-sm font-medium text-stone-700">Garden size</legend>
                      <p className="mt-1 text-xs text-stone-500">Price updates based on how much garden we maintain.</p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        {(Object.keys(GARDEN_SIZE_GUIDE) as GardenSize[]).map((size) => {
                          const selected = form.gardenSize === size;
                          const guide = GARDEN_SIZE_GUIDE[size];
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => updateField("gardenSize", size)}
                              className={`rounded-2xl border p-4 text-left transition ${
                                selected
                                  ? "border-gardens-primary bg-gardens-light/50 ring-2 ring-gardens-primary/30"
                                  : "border-stone-200 bg-white hover:border-stone-300"
                              }`}
                            >
                              <p className="font-semibold text-gardens-dark">{guide.label}</p>
                              <p className="mt-1 text-xs text-stone-600">{guide.description}</p>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="space-y-3">
                      {visibleTiers.map(({ id, label, tagline, plan }) => {
                        if (!plan) return null;
                        const selected = selectedTier === id;
                        const price = planPriceForGarden(plan, form.gardenSize);
                        const isPremium = id === "premium";
                        return (
                          <button
                            key={plan.id}
                            type="button"
                            onClick={() => setSelectedTier(id)}
                            className={`relative w-full rounded-2xl border p-5 text-left transition ${
                              selected
                                ? "border-gardens-primary bg-gardens-light/50 ring-2 ring-gardens-primary/30"
                                : "border-stone-200 bg-white hover:border-stone-300"
                            }`}
                          >
                            {isPremium && (
                              <span className="absolute -top-2.5 left-4 rounded-full bg-gardens-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                                Most popular
                              </span>
                            )}
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-gardens-dark">{label}</p>
                                <p className="text-sm text-stone-500">{tagline}</p>
                                <p className="mt-1 text-sm text-stone-600">{planVisitSummary(plan)}</p>
                                <p className="mt-3 text-2xl font-bold text-gardens-primary">
                                  {formatPriceFrom(price, billing === "Monthly" ? "mo" : "yr")}
                                </p>
                                <p className="mt-1 text-xs text-stone-500">
                                  {GARDEN_SIZE_GUIDE[form.gardenSize].label} garden · {plan.minimumTermMonths}-month minimum
                                </p>
                                <ul className="mt-3 space-y-1 text-xs text-stone-600">
                                  {planFeatures(plan).slice(0, 3).map((f) => (
                                    <li key={f}>• {f}</li>
                                  ))}
                                </ul>
                              </div>
                              {selected && <Check className="h-5 w-5 shrink-0 text-gardens-primary" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
                <p className="text-sm text-stone-600">
                  Where should we maintain your garden? We match you with a local gardener in your area.
                </p>
                <Field label="Address line 1" value={form.line1} onChange={(v) => updateField("line1", v)} required autoComplete="address-line1" />
                <Field label="Address line 2 (optional)" value={form.line2} onChange={(v) => updateField("line2", v)} autoComplete="address-line2" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City" value={form.city} onChange={(v) => updateField("city", v)} required autoComplete="address-level2" />
                  <Field
                    label="Postcode"
                    value={form.postcode}
                    onChange={(v) => updateField("postcode", v)}
                    onBlur={() => updateField("postcode", normalizeUkPostcode(form.postcode))}
                    required
                    autoComplete="postal-code"
                  />
                </div>
                <AvailabilityPicker value={form.availability} onChange={(v) => updateField("availability", v)} />
                <Field
                  label="Create a password"
                  type="password"
                  value={form.password}
                  onChange={(v) => updateField("password", v)}
                  required
                  autoComplete="new-password"
                  hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
                />
                <p className="text-xs text-stone-500">
                  By continuing to payment, you agree to our{" "}
                  <Link href="/terms" className="font-medium text-gardens-primary hover:underline" target="_blank">
                    terms of service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-gardens-primary hover:underline" target="_blank">
                    privacy policy
                  </Link>
                  .
                </p>
                <div className="space-y-3 border-t border-stone-100 pt-4">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Garden photos (optional)</p>
                    <p className="text-xs text-stone-500">
                      Up to 3 photos help your gardener prepare — uploaded after payment.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {photoPreviewUrls.map((url, index) => (
                      <div key={url} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Garden photo ${index + 1}`}
                          className="h-20 w-20 rounded-xl border border-stone-200 object-cover"
                        />
                        <button
                          type="button"
                          className="absolute -right-2 -top-2 rounded-full bg-white px-2 py-0.5 text-xs text-red-600 shadow ring-1 ring-stone-200"
                          onClick={() => setPendingPhotos((files) => files.filter((_, i) => i !== index))}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    {pendingPhotos.length < 3 && (
                      <label className="inline-flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 text-xs font-medium text-stone-600 hover:bg-stone-50">
                        {photoBusy ? <LoadingSpinner label="" /> : "+ Add"}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/*"
                          className="sr-only"
                          disabled={photoBusy || loading}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            e.target.value = "";
                            if (!file) return;
                            setPhotoBusy(true);
                            void compressImageFile(file)
                              .then((compressed) => {
                                setPendingPhotos((files) => [...files, compressed].slice(0, 3));
                              })
                              .catch(() => {
                                setError("Could not process that photo. Try a smaller image.");
                              })
                              .finally(() => setPhotoBusy(false));
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {stepHint && (
              <p className="mt-4 text-sm text-amber-800" role="status">
                {stepHint}
              </p>
            )}

            <div className="mt-8 hidden flex-col gap-3 sm:flex sm:flex-row sm:justify-between">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStepHint(null);
                    (document.activeElement as HTMLElement | null)?.blur?.();
                    setStep((s) => s - 1);
                  }}
                  className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-full border border-stone-200 px-6 text-base font-medium text-stone-700"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              ) : (
                <div />
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={tryAdvance}
                  className="btn-primary gap-1 sm:ml-auto"
                >
                  Continue <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={submit}
                  className="btn-primary sm:ml-auto"
                >
                  {loading ? "Continuing to payment…" : skipPayment ? "Create account" : "Continue to secure payment"}
                </button>
              )}
            </div>
          </div>

          {step >= 1 && selectedPlan && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SignupSummary plan={selectedPlan} gardenSize={form.gardenSize} />
              </div>
            </aside>
          )}
        </div>

        {(step >= 1 && selectedPlan) || step === 0 ? (
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
            {step >= 1 && selectedPlan ? (
              <SignupSummary plan={selectedPlan} gardenSize={form.gardenSize} compact />
            ) : (
              <p className="text-center text-xs text-stone-500">Step 1 of 3 — quick contact details only</p>
            )}
            <div className="mt-3 flex gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setStepHint(null);
                    (document.activeElement as HTMLElement | null)?.blur?.();
                    setStep((s) => s - 1);
                  }}
                  className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-stone-200 text-sm font-medium text-stone-700"
                >
                  Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button type="button" onClick={tryAdvance} className="btn-primary min-h-[48px] flex-[2]">
                  Continue
                </button>
              ) : (
                <button type="button" disabled={loading} onClick={submit} className="btn-primary min-h-[48px] flex-[2]">
                  {loading ? "Processing…" : skipPayment ? "Create account" : "Pay securely"}
                </button>
              )}
            </div>
          </div>
        ) : null}

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
  onBlur,
  type = "text",
  required,
  autoComplete,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        className="field-input"
      />
      {hint && <span className="mt-1 block text-xs font-normal text-stone-500">{hint}</span>}
    </label>
  );
}
