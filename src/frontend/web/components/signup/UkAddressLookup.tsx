"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  formatUkAddressOneLine,
  type UkAddressFields,
  type UkAddressSuggestion,
} from "@/lib/uk-address";
import { normalizeUkPostcode } from "@/lib/signup-utils";

function Field({
  label,
  value,
  onChange,
  onBlur,
  required,
  autoComplete,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  required?: boolean;
  autoComplete?: string;
  testId?: string;
}) {
  return (
    <label className="block text-sm font-medium text-stone-700">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        required={required}
        autoComplete={autoComplete}
        data-testid={testId}
        className="field-input"
      />
    </label>
  );
}

export function UkAddressLookup({
  value,
  onChange,
}: {
  value: UkAddressFields;
  onChange: (next: UkAddressFields) => void;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [lookupEnabled, setLookupEnabled] = useState<boolean | null>(null);
  const [manual, setManual] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<UkAddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [picked, setPicked] = useState(false);

  const hasAddress =
    Boolean(value.line1.trim()) && Boolean(value.city.trim()) && Boolean(value.postcode.trim());

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/addresses/config")
      .then((r) => r.json())
      .then((data: { enabled?: boolean }) => {
        if (!cancelled) setLookupEnabled(Boolean(data.enabled));
      })
      .catch(() => {
        if (!cancelled) setLookupEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (lookupEnabled !== true || manual) return;
    const term = query.trim();
    if (term.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setLookupError(null);
      return;
    }

    const handle = window.setTimeout(() => {
      setLoading(true);
      setLookupError(null);
      void fetch(`/api/addresses/autocomplete?q=${encodeURIComponent(term)}`)
        .then(async (r) => {
          const data = (await r.json()) as {
            suggestions?: UkAddressSuggestion[];
            error?: string;
          };
          if (data.error) setLookupError(data.error);
          setSuggestions(data.suggestions ?? []);
          setOpen((data.suggestions ?? []).length > 0);
          setHighlight(-1);
        })
        .catch(() => {
          setSuggestions([]);
          setOpen(false);
          setLookupError("Could not search addresses. Check your connection.");
        })
        .finally(() => setLoading(false));
    }, 320);

    return () => window.clearTimeout(handle);
  }, [query, lookupEnabled, manual]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const selectSuggestion = useCallback(
    async (suggestion: UkAddressSuggestion) => {
      setResolving(true);
      setLookupError(null);
      setOpen(false);
      try {
        const res = await fetch(`/api/addresses/retrieve?id=${encodeURIComponent(suggestion.id)}`);
        const data = (await res.json()) as { address?: UkAddressFields; error?: string };
        if (!res.ok || !data.address) {
          setLookupError(data.error ?? "Could not load that address.");
          return;
        }
        onChange(data.address);
        setQuery(suggestion.address);
        setPicked(true);
        setManual(false);
      } catch {
        setLookupError("Could not load that address.");
      } finally {
        setResolving(false);
      }
    },
    [onChange]
  );

  function clearSelection() {
    setPicked(false);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
    onChange({ line1: "", line2: "", city: "", postcode: "" });
    window.queueMicrotask(() => inputRef.current?.focus());
  }

  if (lookupEnabled === null) {
    return <p className="text-sm text-stone-500">Loading address search…</p>;
  }

  if (!lookupEnabled || manual) {
    return (
      <div className="space-y-4">
        {lookupEnabled ? (
          <button
            type="button"
            className="text-sm font-medium text-gardens-primary hover:underline"
            onClick={() => {
              setManual(false);
              setPicked(false);
              setQuery("");
            }}
          >
            ← Search for your address instead
          </button>
        ) : null}
        <Field
          label="Address line 1"
          value={value.line1}
          onChange={(v) => onChange({ ...value, line1: v })}
          required
          autoComplete="address-line1"
          testId="address-line1"
        />
        <Field
          label="Address line 2 (optional)"
          value={value.line2}
          onChange={(v) => onChange({ ...value, line2: v })}
          autoComplete="address-line2"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="City"
            value={value.city}
            onChange={(v) => onChange({ ...value, city: v })}
            required
            autoComplete="address-level2"
          />
          <Field
            label="Postcode"
            value={value.postcode}
            onChange={(v) => onChange({ ...value, postcode: v })}
            onBlur={() => onChange({ ...value, postcode: normalizeUkPostcode(value.postcode) })}
            required
            autoComplete="postal-code"
          />
        </div>
      </div>
    );
  }

  if (picked && hasAddress) {
    return (
      <div className="rounded-xl border border-gardens-primary/25 bg-gardens-light/30 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gardens-primary">Your address</p>
        <p className="mt-1 text-sm text-stone-800">{formatUkAddressOneLine(value)}</p>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            className="font-medium text-gardens-primary hover:underline"
            onClick={clearSelection}
          >
            Change address
          </button>
          <button
            type="button"
            className="font-medium text-stone-600 hover:underline"
            data-testid="address-manual-toggle"
            onClick={() => {
              setManual(true);
              setPicked(false);
            }}
          >
            Edit manually
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="space-y-2">
      <label className="block text-sm font-medium text-stone-700" htmlFor={`${listId}-input`}>
        Find your address
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPicked(false);
            setLookupError(null);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (!open && e.key !== "ArrowDown") return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlight((h) => Math.max(h - 1, 0));
            } else if (e.key === "Enter" && highlight >= 0 && suggestions[highlight]) {
              e.preventDefault();
              void selectSuggestion(suggestions[highlight]);
            } else if (e.key === "Escape") {
              setOpen(false);
              setHighlight(-1);
            }
          }}
          placeholder="Start typing your address or postcode"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={open ? `${listId}-listbox` : undefined}
          className="field-input"
        />
        {(loading || resolving) && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            {resolving ? "Loading…" : "Searching…"}
          </span>
        )}
        {open && suggestions.length > 0 && (
          <ul
            id={`${listId}-listbox`}
            role="listbox"
            className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((s, index) => (
              <li key={s.id} role="option" aria-selected={index === highlight}>
                <button
                  type="button"
                  className={`flex min-h-[44px] w-full items-center px-3 py-2.5 text-left text-sm text-stone-800 hover:bg-gardens-light/60 ${
                    index === highlight ? "bg-gardens-light/60" : ""
                  }`}
                  onMouseEnter={() => setHighlight(index)}
                  onClick={() => void selectSuggestion(s)}
                >
                  {s.address}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {lookupError ? <p className="text-xs text-red-600">{lookupError}</p> : null}
      {!open && query.trim().length > 0 && query.trim().length < 3 ? (
        <p className="text-xs text-stone-500">Type at least 3 characters to search.</p>
      ) : null}
      <button
        type="button"
        data-testid="address-manual-toggle"
        className="text-sm font-medium text-stone-600 hover:text-gardens-primary hover:underline"
        onClick={() => setManual(true)}
      >
        Enter address manually
      </button>
    </div>
  );
}
