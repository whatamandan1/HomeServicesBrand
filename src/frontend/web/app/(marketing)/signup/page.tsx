"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { api, type AuthResponse, type GardenSize, type SubscriptionPlan } from "@/lib/api";
import { FALLBACK_PLANS, sortPlans } from "@/lib/plans";
import {
  findSignupMonthlyPlanForFrequency,
  formatQuotedPrice,
  GARDEN_SIZE_ABOVE_BAND_NOTE,
  GARDEN_SIZE_GUIDE,
  CUSTOMER_VISIT_RESPONSIBILITIES,
  CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY,
  GARDEN_SIZE_MAINTAINED_AREA_NOTE,
  GARDEN_SIZE_ORDER,
  countSignupAddons,
  effectiveMinimumTermMonths,
  formatSignupAddonOccurrencesLabel,
  isSignupAddon,
  planPriceForGarden,
  signupQuoteIncludedLines,
  DEFAULT_VISIT_FREQUENCY,
  SIGNUP_ADDON_SERVICE_IDS,
  CORE_VISIT_WORK,
  SIGNUP_CHECKBOX_GROUPS,
  SIGNUP_SERVICE_GROUP_LABELS,
  SIGNUP_SERVICES,
  type SignupServiceId,
} from "@/lib/consumer-plans";
import { saveAuth } from "@/lib/auth-storage";
import { stashSignupPhotos } from "@/lib/pending-signup-photos";
import { compressImageFile } from "@/lib/compress-image";
import {
  isValidEmail,
  isValidUkPostcode,
  MIN_PASSWORD_LENGTH,
  normalizeUkPostcode,
} from "@/lib/signup-utils";
import { trackMarketingEvent } from "@/components/marketing/MarketingAnalytics";
import { useSignupLeadCapture } from "@/lib/use-signup-lead";
import { AlertBanner, LoadingSpinner } from "@/components/ui/feedback";
import { AvailabilityPicker } from "@/components/signup/AvailabilityPicker";
import { SignupVisitFrequencyPicker } from "@/components/signup/SignupVisitFrequencyPicker";
import { UkAddressLookup } from "@/components/signup/UkAddressLookup";
import { SIGNUP_MOBILE_WIZARD_PADDING_CLASS } from "@/lib/mobile-chrome";

const STEPS = ["Garden size", "Add-ons", "Your quote", "Finish signup"] as const;

const SIGNUP_MOBILE_FOOTER_CLEARANCE_PX = 148;

function isMobileSignupLayout() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
}

function ensureVisibleAboveSignupFooter(
  target: HTMLElement | null,
  gapPx = SIGNUP_MOBILE_FOOTER_CLEARANCE_PX
) {
  if (!target || !isMobileSignupLayout()) return;
  requestAnimationFrame(() => {
    const targetRect = target.getBoundingClientRect();
    const overflow = targetRect.bottom - (window.innerHeight - gapPx);
    if (overflow > 0) {
      window.scrollBy({ top: overflow, behavior: "smooth" });
    }
  });
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<SignupServiceId[]>([]);
  const [visitFrequency, setVisitFrequency] = useState<SignupServiceId>(DEFAULT_VISIT_FREQUENCY);
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
  const mobileScrollRef = useRef<HTMLDivElement>(null);
  const trackedLead = useRef(false);
  const trackedCheckout = useRef(false);

  const addonCount = useMemo(() => countSignupAddons(selectedServices), [selectedServices]);

  const selectedAddonIds = useMemo(
    () => selectedServices.filter((id) => SIGNUP_ADDON_SERVICE_IDS.includes(id)),
    [selectedServices]
  );

  const quoteIncludedLines = useMemo(
    () => signupQuoteIncludedLines(visitFrequency, selectedAddonIds),
    [visitFrequency, selectedAddonIds]
  );

  useEffect(() => {
    const urls = pendingPhotos.map((file) => URL.createObjectURL(file));
    setPhotoPreviewUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [pendingPhotos]);

  function applyPlans(sorted: SubscriptionPlan[], frequency: SignupServiceId = visitFrequency) {
    setPlans(sorted);
    const plan = findSignupMonthlyPlanForFrequency(sorted, frequency);
    if (plan) setSelectedPlanId(plan.id);
  }

  useEffect(() => {
    if (plans.length === 0) return;
    const plan = findSignupMonthlyPlanForFrequency(plans, visitFrequency);
    if (plan) setSelectedPlanId(plan.id);
  }, [visitFrequency, plans]);

  useEffect(() => {
    if (step !== 2 || !quoteUnveiled) return;
    requestAnimationFrame(() => {
      const root = mobileScrollRef.current;
      const quote = root?.querySelector("[data-signup-quote]");
      const included = root?.querySelector("[data-signup-quote-included]");
      quote?.scrollIntoView({ block: "start", behavior: "smooth" });
      ensureVisibleAboveSignupFooter((included ?? quote) as HTMLElement | null);
    });
  }, [quoteUnveiled, step]);

  useEffect(() => {
    setPlansLoading(true);
    api
      .getPlans()
      .then((p) => applyPlans(sortPlans(p)))
      .catch(() => {
        applyPlans(sortPlans(FALLBACK_PLANS));
        setError(
          process.env.NODE_ENV === "development"
            ? "Could not load live plans - showing standard pricing. Signup may fail until the API is reachable."
            : "We're having trouble loading plans. Please refresh the page or try again in a moment."
        );
      })
      .finally(() => setPlansLoading(false));
    api.getPublicConfig().then((c) => setSkipPayment(c.bypassStripeCheckout)).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (trackedLead.current) return;
    trackedLead.current = true;
    trackMarketingEvent("generate_lead", { event_category: "signup" });
  }, []);

  useEffect(() => {
    if (step !== 3 || trackedCheckout.current) return;
    trackedCheckout.current = true;
    trackMarketingEvent("begin_checkout", { event_category: "signup" });
  }, [step]);

  useLayoutEffect(() => {
    if (isMobileSignupLayout()) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      return;
    }
    topRef.current?.scrollIntoView({ block: "start" });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [step]);

  function updateField(name: string, value: string) {
    setForm((f) => ({ ...f, [name]: value }));
    setStepHint(null);
  }

  function toggleService(id: SignupServiceId) {
    setSelectedServices((current) =>
      current.includes(id) ? current.filter((s) => s !== id) : [...current, id]
    );
    setStepHint(null);
  }

  const selectedPlan =
    plans.find((p) => p.id === selectedPlanId) ?? findSignupMonthlyPlanForFrequency(plans, visitFrequency);

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
      if (!selectedPlanId) return "We could not find a plan - please refresh and try again.";
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
        selectedSignupAddons: selectedAddonIds,
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

  const activePlan = selectedPlan;
  const minimumTermMonths = useMemo(
    () => (activePlan ? effectiveMinimumTermMonths(activePlan, selectedServices) : 3),
    [activePlan, selectedServices]
  );

  const mobileFooter = (
    <div className="flex w-full flex-col">
      <div className="flex w-full gap-2">
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
          <button
            type="button"
            onClick={tryAdvance}
            className={`btn-primary min-h-[48px] max-md:!w-full ${step > 0 ? "flex-[2]" : "w-full"}`}
          >
            {step === 2 && !quoteUnveiled ? "See my quote" : "Continue"}
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className={`btn-primary min-h-[48px] max-md:!w-full ${step > 0 ? "flex-[2]" : "w-full"}`}
          >
            {loading ? "Processing…" : skipPayment ? "Create account" : "Continue"}
          </button>
        )}
      </div>
      <p className="mt-2 w-full text-center text-xs text-stone-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-gardens-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );

  return (
    <div
      data-signup-wizard
      className={`pt-4 max-md:pt-3 md:pb-12 md:pt-12 ${SIGNUP_MOBILE_WIZARD_PADDING_CLASS}`}
    >
      <div ref={topRef} className="mx-auto w-full max-w-5xl shrink-0 scroll-mt-8 px-4">
        <div className="text-center">
          <h1 className="font-display text-xl font-bold text-gardens-dark sm:text-3xl">
            {step === 2 ? "Your quote" : "Get your quote"}
          </h1>
          <p className="mt-1.5 text-sm text-stone-600 sm:mt-2">
            Step {step + 1} of {STEPS.length}
            <span className="hidden sm:inline"> - {STEPS[step]}</span>
          </p>
        </div>

        <div className="mt-4 flex gap-2 sm:mt-6" aria-hidden>
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full ${i <= step ? "bg-gardens-primary" : "bg-stone-200"}`}
              />
              <p className="mt-1 hidden text-center text-xs text-stone-500 sm:block">{label}</p>
            </div>
          ))}
        </div>

      </div>

      <div className="mx-auto w-full max-w-5xl md:px-4">
        <div ref={mobileScrollRef} data-testid="signup-mobile-scroll" className="mt-3 max-md:px-4 md:mt-8">
            {usingFallback && (
              <AlertBanner
                variant="warning"
                message={
                  process.env.NODE_ENV === "development"
                    ? "Live plans could not be loaded. Signup will work once the API connection is restored."
                    : "We're having trouble loading the latest plans. Please refresh the page before continuing."
                }
                className="mb-4"
              />
            )}

            {skipPayment && process.env.NODE_ENV === "development" && (
              <AlertBanner
                variant="warning"
                message="Dev mode: payment skipped - subscription activates immediately."
                className="mb-4"
              />
            )}

            {error && (
              <AlertBanner variant="error" message={error} onDismiss={() => setError(null)} className="mb-4" />
            )}
            {step === 0 && (
              <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-soft sm:p-6">
                <p className="text-sm text-stone-600">{GARDEN_SIZE_MAINTAINED_AREA_NOTE}</p>
                <fieldset>
                  <legend className="sr-only">Garden size</legend>
                  <div className="grid gap-3 sm:grid-cols-3">
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
                <p className="text-xs text-stone-500">{GARDEN_SIZE_ABOVE_BAND_NOTE}</p>
              </div>
            )}

            {step === 1 && (
              <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-soft sm:p-5">
                <SignupVisitFrequencyPicker
                  value={visitFrequency}
                  onChange={(id) => {
                    setVisitFrequency(id);
                    setStepHint(null);
                  }}
                />
                <details
                  className="mt-4 rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 md:hidden"
                  onToggle={(e) => {
                    if (!e.currentTarget.open) return;
                    ensureVisibleAboveSignupFooter(e.currentTarget);
                    const addons = e.currentTarget.parentElement?.querySelector("[data-signup-addons]");
                    if (addons instanceof HTMLElement) {
                      requestAnimationFrame(() => ensureVisibleAboveSignupFooter(addons));
                    }
                  }}
                >
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {SIGNUP_SERVICE_GROUP_LABELS.core}
                  </summary>
                  <ul className="mt-2 space-y-0.5 text-sm text-stone-700">
                    {CORE_VISIT_WORK.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gardens-primary" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </details>
                <div className="mt-4 hidden rounded-lg border border-stone-100 bg-stone-50 px-3 py-2 md:block">
                  <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                    {SIGNUP_SERVICE_GROUP_LABELS.core}
                  </p>
                  <ul className="mt-1.5 space-y-0.5 text-sm text-stone-700">
                    {CORE_VISIT_WORK.map((item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gardens-primary" aria-hidden />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div data-signup-addons className="mt-3 space-y-3 max-md:pb-2">
                  {SIGNUP_CHECKBOX_GROUPS.map((group) => {
                    const options = SIGNUP_SERVICES.filter((s) => s.group === group);
                    if (options.length === 0) return null;
                    return (
                      <fieldset key={group}>
                        <legend className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                          {SIGNUP_SERVICE_GROUP_LABELS[group]}
                        </legend>
                        <ul className="mt-1.5 flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-1">
                          {options.map((service) => {
                            const checked = selectedServices.includes(service.id);
                            const occLabel = isSignupAddon(service.id)
                              ? formatSignupAddonOccurrencesLabel(service.id)
                              : "";
                            return (
                              <li key={service.id}>
                                <label
                                  className={`flex min-h-[48px] cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-2.5 text-sm transition sm:min-h-0 sm:py-2 ${
                                    checked
                                      ? "border-gardens-primary bg-gardens-light/50 text-gardens-dark"
                                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-300"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 shrink-0 rounded border-stone-300 text-gardens-primary focus:ring-gardens-primary"
                                    checked={checked}
                                    onChange={() => toggleService(service.id)}
                                  />
                                  <span className="min-w-0 leading-snug">
                                    <span className="font-medium text-stone-800">{service.label}</span>
                                    {occLabel ? (
                                      <span className="ml-1.5 text-xs font-normal text-gardens-primary">
                                        {occLabel}
                                      </span>
                                    ) : null}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </fieldset>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
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

                {quoteUnveiled && !plansLoading && activePlan && (
                  <div
                    data-signup-quote
                    className="rounded-2xl border border-gardens-primary/30 bg-gardens-light/40 p-5 sm:p-6"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">
                      Your personalised quote
                    </p>
                    <p className="mt-2 font-display text-xl font-bold text-gardens-dark">Garden care</p>
                    <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-gardens-primary/15 pt-4">
                      <p className="text-xs text-stone-500">Billed monthly</p>
                      <div className="text-right">
                        <p className="text-xs text-stone-600">
                          {GARDEN_SIZE_GUIDE[form.gardenSize].label} · {minimumTermMonths}-month min
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gardens-primary">
                          {formatQuotedPrice(
                            planPriceForGarden(activePlan, form.gardenSize, selectedServices),
                            "mo"
                          )}
                        </p>
                      </div>
                    </div>
                    <div
                      data-signup-quote-included
                      className="mt-4 border-t border-gardens-primary/15 pt-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                        What&apos;s included
                      </p>
                      <ul className="mt-2 space-y-1.5 pb-1 text-sm text-stone-700">
                        {quoteIncludedLines.map((item) => (
                          <li key={item} className="flex gap-2">
                            <Check
                              className="mt-0.5 h-4 w-4 shrink-0 text-gardens-primary"
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div
                data-signup-finish
                className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-soft sm:space-y-5 sm:p-6"
              >
                <p className="text-sm text-stone-600">
                  Last step - tell us who you are and where we&apos;ll maintain your garden.
                </p>
                <Field label="First name" value={form.firstName} onChange={(v) => updateField("firstName", v)} required autoComplete="given-name" />
                <Field label="Last name" value={form.lastName} onChange={(v) => updateField("lastName", v)} required autoComplete="family-name" />
                <UkAddressLookup
                  value={{
                    line1: form.line1,
                    line2: form.line2,
                    city: form.city,
                    postcode: form.postcode,
                  }}
                  onChange={(addr) => {
                    setForm((f) => ({ ...f, ...addr }));
                  }}
                />
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
                <details
                  className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 md:hidden"
                  onToggle={(e) => {
                    if (!e.currentTarget.open) return;
                    ensureVisibleAboveSignupFooter(e.currentTarget);
                  }}
                >
                  <summary className="cursor-pointer text-sm font-medium text-stone-800">
                    Before each visit - your part
                  </summary>
                  <p className="mt-2 text-xs text-stone-600">{CUSTOMER_VISIT_RESPONSIBILITIES_SUMMARY}</p>
                  <p className="mt-2 text-xs">
                    <Link href="/terms" className="font-medium text-gardens-primary hover:underline" target="_blank">
                      Full prep list in terms
                    </Link>
                  </p>
                </details>
                <div className="hidden rounded-xl border border-stone-200 bg-stone-50 px-3 py-3 text-xs text-stone-600 sm:px-4 md:block">
                  <p className="font-medium text-stone-800">Before each visit</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {CUSTOMER_VISIT_RESPONSIBILITIES.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-stone-500">
                  By continuing, you agree to our{" "}
                  <Link href="/terms" className="font-medium text-gardens-primary hover:underline" target="_blank">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="font-medium text-gardens-primary hover:underline" target="_blank">
                    privacy policy
                  </Link>
                  . <strong>{minimumTermMonths}-month minimum term</strong>
                  {addonCount > 0 ? "; 6 months if you chose add-ons." : "."}
                </p>
                <div className="space-y-3 border-t border-stone-100 pt-4">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Garden photos (optional)</p>
                    <p className="text-xs text-stone-500">
                      Up to 3 photos help your gardener prepare - uploaded after payment.
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


            <div className="mt-8 hidden w-full md:block">
              <div className="flex w-full flex-row items-center justify-between gap-3">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="inline-flex min-h-[48px] items-center justify-center gap-1 rounded-full border border-stone-200 px-6 text-base font-medium text-stone-700"
                  >
                    <ChevronLeft className="h-4 w-4" /> Back
                  </button>
                ) : (
                  <div className="min-w-0 flex-1" aria-hidden />
                )}

                {step < STEPS.length - 1 ? (
                  <button type="button" onClick={tryAdvance} className="btn-primary shrink-0 gap-1">
                    {step === 2 && !quoteUnveiled ? "See my quote" : "Continue"}
                    {!(step === 2 && !quoteUnveiled) && <ChevronRight className="h-4 w-4" />}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={submit}
                    className="btn-primary shrink-0"
                  >
                    {loading ? "Processing…" : skipPayment ? "Create account" : "Continue"}
                  </button>
                )}
              </div>
              <p className="mt-4 w-full text-center text-sm text-stone-500">
                Already have an account?{" "}
                <Link href="/login" className="font-medium text-gardens-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
        </div>

        <div
          data-testid="signup-mobile-footer"
          className="hidden shrink-0 border-t border-stone-200 bg-white/95 px-3 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))] max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-30 max-md:block"
        >
          {mobileFooter}
        </div>
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
