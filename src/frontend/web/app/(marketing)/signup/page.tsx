"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { api, type AuthResponse, type GardenSize, type SubscriptionPlan } from "@/lib/api";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";
import {
  ANNUAL_BILLING_HINT,
  ANNUAL_BILLING_SAVINGS,
  annualEquivalentMonthly,
  findTierPlanForBilling,
  formatPriceFrom,
  GARDEN_SIZE_GUIDE,
  GARDEN_SIZE_ORDER,
  matchPlanTierFromServices,
  planFeatures,
  planPriceForGarden,
  planVisitSummary,
  PLAN_TIERS,
  SIGNUP_SERVICE_GROUP_LABELS,
  SIGNUP_SERVICES,
  type BillingChoice,
  type PlanTier,
  type SignupServiceGroup,
  type SignupServiceId,
} from "@/lib/consumer-plans";
import { BillingIntervalToggle } from "@/components/marketing/BillingIntervalToggle";
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
import { formatGbp } from "@/lib/format";
import { useSignupLeadCapture } from "@/lib/use-signup-lead";
import { AlertBanner, LoadingSpinner } from "@/components/ui/feedback";
import { AvailabilityPicker } from "@/components/signup/AvailabilityPicker";
import { SignupSummary } from "@/components/signup/SignupSummary";

const STEPS = ["Garden size", "Find your plan", "Your quote", "Finish signup"] as const;

const SERVICE_GROUPS: SignupServiceGroup[] = ["core", "garden-care", "visit-frequency", "extras"];

const DEFAULT_SERVICES: SignupServiceId[] = ["lawn-borders", "monthly-visits"];

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [billing, setBilling] = useState<BillingChoice>("Annual");
  const [selectedTier, setSelectedTier] = useState<PlanTier>("essential");
  const [selectedServices, setSelectedServices] = useState<SignupServiceId[]>(DEFAULT_SERVICES);
  const [showPlanAlternatives, setShowPlanAlternatives] = useState(false);
  const [planOverridden, setPlanOverridden] = useState(false);
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
  const [quoteUnveiled, setQuoteUnveiled] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const matchedTier = useMemo(
    () => matchPlanTierFromServices(selectedServices),
    [selectedServices]
  );

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
      setPlanOverridden(true);
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

  useEffect(() => {
    if (!planOverridden) setSelectedTier(matchedTier);
  }, [matchedTier, planOverridden]);

  useLayoutEffect(() => {
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  function updateField(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    setStepHint(null);
  }

  function toggleService(id: SignupServiceId) {
    setSelectedServices((current) => {
      if (current.includes(id)) {
        const next = current.filter((s) => s !== id);
        return next.length === 0 ? current : next;
      }
      return [...current, id];
    });
    setPlanOverridden(false);
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
    if (step === 1) {
      if (selectedServices.length === 0) return "Select at least one service to continue.";
      if (!selectedPlanId) return "We could not find a plan — please refresh and try again.";
      return null;
    }
    if (step === 2) {
      if (!isValidEmail(form.email)) return "Enter a valid email address to see your quote.";
      return null;
    }
    if (step === 3) {
      if (!quoteUnveiled) return "View your quote before continuing.";
      if (!form.firstName.trim()) return "Enter your first name.";
      if (!form.lastName.trim()) return "Enter your last name.";
      if (!form.line1.trim() || !form.city.trim()) return "Enter your address and city.";
      if (!isValidUkPostcode(form.postcode)) return "Enter a valid UK postcode (e.g. LS1 4AP).";
      if (!form.availability.trim()) return "Tell us when visits work best for you.";
      if (form.password.length < MIN_PASSWORD_LENGTH) {
        return `Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
      }
      return null;
    }
    return null;
  }

  async function tryAdvance() {
    const message = stepValidationMessage();
    if (message) {
      setStepHint(message);
      return;
    }
    setStepHint(null);
    if (step === 3) await captureLead();
    if (step === 2 && !quoteUnveiled) {
      await captureLead();
      setQuoteUnveiled(true);
      return;
    }
    (document.activeElement as HTMLElement | null)?.blur?.();
    setStep((s) => s + 1);
  }

  function goBack() {
    setStepHint(null);
    (document.activeElement as HTMLElement | null)?.blur?.();
    setStep((s) => {
      const prev = s - 1;
      if (s === 2 && quoteUnveiled) setQuoteUnveiled(false);
      return prev;
    });
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
  const showSummary = step >= 1 && selectedPlan;
  const showSummaryPrice = quoteUnveiled && step >= 2;

  const visibleTiers = useMemo(
    () =>
      PLAN_TIERS.map((tier) => ({
        ...tier,
        plan: findTierPlanForBilling(plans, tier.id, billing),
      })).filter((t) => t.plan),
    [plans, billing]
  );

  const activePlan = findTierPlanForBilling(plans, selectedTier, billing);
  const activeTierMeta = PLAN_TIERS.find((t) => t.id === selectedTier);

  return (
    <div className="pb-32 pt-8 md:pb-12 md:pt-12">
      <div ref={topRef} className="mx-auto max-w-5xl scroll-mt-8 px-4">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-gardens-dark sm:text-3xl">
            {step === 2 ? "Your quote" : "Find your plan"}
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

        <div className={`mt-8 ${showSummary ? "lg:grid lg:grid-cols-[1fr_280px] lg:gap-8" : ""}`}>
          <div>
            {step === 0 && (
              <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
                <p className="text-sm text-stone-600">
                  How much garden will we maintain? This helps us match the right visit scope — pricing
                  comes after we recommend a plan.
                </p>
                <fieldset>
                  <legend className="sr-only">Garden size</legend>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {GARDEN_SIZE_ORDER.map((size) => {
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
              </div>
            )}

            {step === 1 && (
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft sm:p-5">
                <p className="text-xs text-stone-600 sm:text-sm">
                  Tick what you need — we&apos;ll match a plan. Price on the next step.
                </p>
                <div className="mt-3 space-y-3">
                  {SERVICE_GROUPS.map((group) => {
                    const options = SIGNUP_SERVICES.filter((s) => s.group === group);
                    if (options.length === 0) return null;
                    return (
                      <fieldset key={group}>
                        <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                          {SIGNUP_SERVICE_GROUP_LABELS[group]}
                        </legend>
                        <ul className="mt-1.5 grid gap-1 sm:grid-cols-2">
                          {options.map((service) => {
                            const checked = selectedServices.includes(service.id);
                            return (
                              <li key={service.id}>
                                <label
                                  title={service.description}
                                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition ${
                                    checked
                                      ? "border-gardens-primary bg-gardens-light/50 text-gardens-dark"
                                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-3.5 w-3.5 shrink-0 rounded border-stone-300 text-gardens-primary focus:ring-gardens-primary"
                                    checked={checked}
                                    onChange={() => toggleService(service.id)}
                                  />
                                  <span className="leading-tight">{service.label}</span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </fieldset>
                    );
                  })}
                </div>

                {plansLoading ? (
                  <div className="mt-3 h-10 animate-pulse rounded-lg bg-stone-200" aria-busy="true" />
                ) : (
                  activeTierMeta &&
                  activePlan && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gardens-primary/25 bg-gardens-light/50 px-3 py-2">
                      <p className="text-sm text-gardens-dark">
                        <span className="font-semibold">{activeTierMeta.label}</span>
                        <span className="text-stone-600"> · {planVisitSummary(activePlan)}</span>
                      </p>
                      <p className="text-xs font-medium text-gardens-primary">Email next for price →</p>
                    </div>
                  )
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
                  <p className="text-sm text-stone-600">
                    Enter your email and we&apos;ll show your personalised quote for a{" "}
                    {GARDEN_SIZE_GUIDE[form.gardenSize].label.toLowerCase()} garden.
                  </p>
                  <div className="mt-4">
                    <Field
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => updateField("email", v)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  <p className="mt-3 text-xs text-stone-500">
                    We&apos;ll email your quote and save your progress if you need to finish later. Marketing
                    emails are optional and you can opt out anytime.
                  </p>
                </div>

                {quoteUnveiled && !plansLoading && activeTierMeta && activePlan && (
                  <div className="rounded-2xl border border-gardens-primary/30 bg-gardens-light/40 p-5 sm:p-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
                      Your personalised quote
                    </p>
                    <p className="mt-2 font-display text-xl font-bold text-gardens-dark">
                      {activeTierMeta.label}
                    </p>
                    <p className="text-sm text-stone-600">{activeTierMeta.tagline}</p>
                    <p className="mt-2 text-sm text-stone-600">{planVisitSummary(activePlan)}</p>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-gardens-primary/15 pt-4">
                      <div className="space-y-2">
                        <BillingIntervalToggle billing={billing} onChange={setBilling} />
                        <p className="text-xs text-stone-500">{ANNUAL_BILLING_HINT}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-600">
                          {GARDEN_SIZE_GUIDE[form.gardenSize].label} · {activePlan.minimumTermMonths}-month min
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gardens-primary">
                          {formatPriceFrom(
                            planPriceForGarden(activePlan, form.gardenSize),
                            billing === "Monthly" ? "mo" : "yr"
                          )}
                        </p>
                        {billing === "Annual" && (
                          <p className="text-xs font-medium text-gardens-primary">
                            From £
                            {formatGbp(
                              annualEquivalentMonthly(planPriceForGarden(activePlan, form.gardenSize))
                            )}
                            /mo billed yearly
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPlanAlternatives((v) => !v)}
                      className="mt-4 flex w-full items-center justify-between rounded-xl border border-stone-200/80 bg-white/80 px-4 py-2.5 text-sm font-medium text-stone-700"
                    >
                      See other plans (optional)
                      {showPlanAlternatives ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    {showPlanAlternatives && (
                      <div className="mt-3 space-y-2">
                        {visibleTiers.map(({ id, label, tagline, plan }) => {
                          if (!plan) return null;
                          const selected = selectedTier === id;
                          const price = planPriceForGarden(plan, form.gardenSize);
                          return (
                            <button
                              key={plan.id}
                              type="button"
                              onClick={() => {
                                setSelectedTier(id);
                                setPlanOverridden(true);
                              }}
                              className={`relative w-full rounded-xl border p-4 text-left transition ${
                                selected
                                  ? "border-gardens-primary bg-white ring-2 ring-gardens-primary/30"
                                  : "border-stone-200 bg-white hover:border-stone-300"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-gardens-dark">{label}</p>
                                  <p className="text-xs text-stone-500">{tagline}</p>
                                  <p className="mt-2 text-lg font-bold text-gardens-primary">
                                    {formatPriceFrom(price, billing === "Monthly" ? "mo" : "yr")}
                                  </p>
                                </div>
                                {selected && <Check className="h-5 w-5 shrink-0 text-gardens-primary" />}
                              </div>
                            </button>
                          );
                        })}
                        <Link
                          href="/#pricing"
                          className="block pt-1 text-center text-xs font-medium text-gardens-primary hover:underline"
                        >
                          Full feature comparison
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
                <p className="text-sm text-stone-600">
                  Last step — tell us who you are and where we&apos;ll maintain your garden.
                </p>
                <Field label="First name" value={form.firstName} onChange={(v) => updateField("firstName", v)} required autoComplete="given-name" />
                <Field label="Last name" value={form.lastName} onChange={(v) => updateField("lastName", v)} required autoComplete="family-name" />
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
                  onClick={goBack}
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
                  {step === 2 && !quoteUnveiled ? "See my quote" : "Continue"}
                  {!(step === 2 && !quoteUnveiled) && <ChevronRight className="h-4 w-4" />}
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

          {showSummary && selectedPlan && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SignupSummary
                  plan={selectedPlan}
                  gardenSize={form.gardenSize}
                  showPrice={showSummaryPrice}
                />
              </div>
            </aside>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 p-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
          {showSummary && selectedPlan ? (
            <SignupSummary
              plan={selectedPlan}
              gardenSize={form.gardenSize}
              compact
              showPrice={showSummaryPrice}
            />
          ) : (
            <p className="text-center text-xs text-stone-500">
              Step {step + 1} of {STEPS.length}
              {step === 0 && " — pick your garden size"}
              {step === 1 && " — tick services, we find your plan"}
              {step === 2 && !quoteUnveiled && " — enter email for your quote"}
            </p>
          )}
          <div className="mt-3 flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-full border border-stone-200 text-sm font-medium text-stone-700"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={tryAdvance} className="btn-primary min-h-[48px] flex-[2]">
                {step === 2 && !quoteUnveiled ? "See my quote" : "Continue"}
              </button>
            ) : (
              <button type="button" disabled={loading} onClick={submit} className="btn-primary min-h-[48px] flex-[2]">
                {loading ? "Processing…" : skipPayment ? "Create account" : "Pay securely"}
              </button>
            )}
          </div>
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
