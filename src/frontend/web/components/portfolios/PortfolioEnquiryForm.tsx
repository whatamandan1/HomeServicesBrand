"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { api, type GardenSize } from "@/lib/api";
import { GARDEN_SIZE_ORDER, gardenSizeSelectLabel } from "@/lib/consumer-plans";

type PropertyRow = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  gardenSize: GardenSize;
};

const emptyProperty = (): PropertyRow => ({
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  gardenSize: "Medium",
});

export function PortfolioEnquiryForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<PropertyRow[]>([emptyProperty(), emptyProperty()]);

  function updateProperty(index: number, field: keyof PropertyRow, value: string) {
    setProperties((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addProperty() {
    setProperties((rows) => [...rows, emptyProperty()]);
  }

  function removeProperty(index: number) {
    if (properties.length <= 2) return;
    setProperties((rows) => rows.filter((_, i) => i !== index));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    try {
      await api.submitPortfolioEnquiry({
        contactName: String(fd.get("contactName")),
        email: String(fd.get("email")),
        phone: String(fd.get("phone")),
        companyName: String(fd.get("companyName") ?? "") || undefined,
        notes: String(fd.get("notes") ?? "") || undefined,
        brandCode: "gardens-sorted",
        properties: properties.map((p) => ({
          line1: p.line1.trim(),
          line2: p.line2.trim() || undefined,
          city: p.city.trim(),
          postcode: p.postcode.trim(),
          gardenSize: p.gardenSize,
        })),
      });
      router.push("/multi-property-solutions/thank-you");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit enquiry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="request-quote" className="scroll-mt-6 pb-20">
      <div className="mx-auto max-w-2xl rounded-2xl border border-gardens-primary/20 bg-white p-6 shadow-soft sm:p-8">
        <h2 className="font-display text-2xl font-semibold text-gardens-dark">Request a quote</h2>
        <p className="mt-2 text-sm text-stone-600">
          Tell us about your properties (minimum two). We&apos;ll review your portfolio and send a personalised indicative quote — subject to confirmation.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
              Your name
              <input name="contactName" required autoComplete="name" className="field-input" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Email
              <input name="email" type="email" required autoComplete="email" className="field-input" />
            </label>
            <label className="block text-sm font-medium text-stone-700">
              Phone
              <input name="phone" type="tel" required autoComplete="tel" className="field-input" />
            </label>
            <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
              Company name <span className="font-normal text-stone-400">(optional)</span>
              <input name="companyName" autoComplete="organization" className="field-input" />
            </label>
          </div>

          <div className="space-y-4 border-t border-stone-100 pt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-gardens-dark">Properties</p>
              <button
                type="button"
                onClick={addProperty}
                className="inline-flex items-center gap-1 text-sm font-medium text-gardens-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add property
              </button>
            </div>

            {properties.map((property, index) => (
              <div key={index} className="rounded-xl border border-stone-200 bg-stone-50/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-stone-700">Property {index + 1}</p>
                  {properties.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeProperty(index)}
                      className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-red-600"
                      aria-label={`Remove property ${index + 1}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                    Address line 1
                    <input
                      required
                      value={property.line1}
                      onChange={(e) => updateProperty(index, "line1", e.target.value)}
                      autoComplete="address-line1"
                      className="field-input"
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                    Address line 2 <span className="font-normal text-stone-400">(optional)</span>
                    <input
                      value={property.line2}
                      onChange={(e) => updateProperty(index, "line2", e.target.value)}
                      autoComplete="address-line2"
                      className="field-input"
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-700">
                    City
                    <input
                      required
                      value={property.city}
                      onChange={(e) => updateProperty(index, "city", e.target.value)}
                      autoComplete="address-level2"
                      className="field-input"
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-700">
                    Postcode
                    <input
                      required
                      value={property.postcode}
                      onChange={(e) => updateProperty(index, "postcode", e.target.value)}
                      autoComplete="postal-code"
                      className="field-input"
                    />
                  </label>
                  <label className="block text-sm font-medium text-stone-700 sm:col-span-2">
                    Garden size
                    <select
                      value={property.gardenSize}
                      onChange={(e) => updateProperty(index, "gardenSize", e.target.value)}
                      className="field-input"
                    >
                      {GARDEN_SIZE_ORDER.map((size) => (
                        <option key={size} value={size}>
                          {gardenSizeSelectLabel(size)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <label className="block text-sm font-medium text-stone-700">
            Anything else we should know? <span className="font-normal text-stone-400">(optional)</span>
            <textarea name="notes" rows={3} className="field-input" />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Submitting…" : "Request a quote"}
          </button>
        </form>
      </div>
    </section>
  );
}
