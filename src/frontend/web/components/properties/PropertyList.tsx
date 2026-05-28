"use client";

import { useState } from "react";
import { PropertyPhotoUpload } from "@/components/properties/PropertyPhotoUpload";
import { api } from "@/lib/api";
import type { CustomerProperty, GardenSize } from "@/lib/api";

type PropertyForm = {
  line1: string;
  line2: string;
  city: string;
  postcode: string;
  gardenSize: GardenSize;
  accessNotes: string;
};

function toForm(property: CustomerProperty): PropertyForm {
  return {
    line1: property.line1,
    line2: property.line2 ?? "",
    city: property.city,
    postcode: property.postcode,
    gardenSize: property.gardenSize,
    accessNotes: property.accessNotes ?? "",
  };
}

type PropertyUpdate = {
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  gardenSize: GardenSize;
  accessNotes: string | null;
};

function PropertyCard({
  property,
  token,
  onSave,
}: {
  property: CustomerProperty;
  token?: string;
  onSave: (id: string, body: PropertyUpdate) => Promise<void>;
}) {
  const [form, setForm] = useState<PropertyForm>(() => toForm(property));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    form.line1 !== property.line1
    || form.line2 !== (property.line2 ?? "")
    || form.city !== property.city
    || form.postcode !== property.postcode
    || form.gardenSize !== property.gardenSize
    || form.accessNotes !== (property.accessNotes ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await onSave(property.id, {
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        postcode: form.postcode.trim(),
        gardenSize: form.gardenSize,
        accessNotes: form.accessNotes.trim() || null,
      });
      setMessage("Property saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-5 shadow-soft">
      {property.isPrimary && (
        <span className="mb-3 inline-block rounded-full bg-gardens-light px-2.5 py-0.5 text-xs font-medium text-gardens-dark">
          Primary property
        </span>
      )}

      <div className="space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Address line 1</span>
          <input
            type="text"
            value={form.line1}
            onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
            className="field-input mt-1"
            autoComplete="address-line1"
            required
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">Address line 2</span>
          <input
            type="text"
            value={form.line2}
            onChange={(e) => setForm((f) => ({ ...f, line2: e.target.value }))}
            className="field-input mt-1"
            autoComplete="address-line2"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium text-stone-700">City</span>
            <input
              type="text"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="field-input mt-1"
              autoComplete="address-level2"
              required
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-stone-700">Postcode</span>
            <input
              type="text"
              value={form.postcode}
              onChange={(e) => setForm((f) => ({ ...f, postcode: e.target.value }))}
              className="field-input mt-1"
              autoComplete="postal-code"
              required
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">Garden size</span>
          <select
            value={form.gardenSize}
            onChange={(e) => setForm((f) => ({ ...f, gardenSize: e.target.value as GardenSize }))}
            className="field-input mt-1"
          >
            <option value="Small">Small (up to 50 m²)</option>
            <option value="Medium">Medium (up to 75 m²)</option>
            <option value="Large">Large (up to 100 m²)</option>
            <option value="XLarge">X Large (up to 125 m²)</option>
            <option value="XXLarge">XX Large (up to 150 m²)</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-stone-700">Access notes</span>
          <span className="mt-0.5 block text-xs text-stone-500">
            Gate codes, parking, pets, or anything your gardener should know before a visit.
          </span>
          <textarea
            value={form.accessNotes}
            onChange={(e) => setForm((f) => ({ ...f, accessNotes: e.target.value }))}
            className="field-input mt-1 min-h-[88px] resize-y"
            rows={3}
            placeholder="e.g. Side gate code 1234, park on the drive"
          />
        </label>
      </div>

      {token && (
        <div className="border-t border-stone-100 pt-4">
          <PropertyPhotoUpload
            token={token}
            propertyId={property.id}
            loadPhotos={api.customerPropertyPhotos}
            uploadPhoto={api.customerUploadPropertyPhoto}
            deletePhoto={api.customerDeletePropertyPhoto}
            fetchPhotoBlob={api.customerFetchPropertyPhoto}
          />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !dirty || !form.line1.trim() || !form.city.trim() || !form.postcode.trim()}
        className="btn-primary mt-4 disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save property"}
      </button>
    </li>
  );
}

export function PropertyList({
  properties,
  token,
  onSave,
}: {
  properties: CustomerProperty[];
  token?: string;
  onSave: (id: string, body: PropertyUpdate) => Promise<void>;
}) {
  if (properties.length === 0) {
    return <p className="mt-2 text-sm text-stone-500">No properties on your account.</p>;
  }

  return (
    <ul className="mt-3 space-y-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} token={token} onSave={onSave} />
      ))}
    </ul>
  );
}
