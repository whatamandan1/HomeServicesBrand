"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = { q: string; a: string };

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-soft">
      {items.map((faq, i) => {
        const open = openIndex === i;
        const panelId = `faq-panel-${i}`;
        const buttonId = `faq-button-${i}`;
        return (
          <div key={faq.q}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-start justify-between gap-4 p-6 text-left font-semibold text-gardens-dark transition hover:bg-stone-50/80"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`mt-0.5 h-5 w-5 shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`}
                  aria-hidden
                />
              </button>
            </h3>
            {open && (
              <div id={panelId} role="region" aria-labelledby={buttonId} className="px-6 pb-6 pt-0">
                <p className="text-sm leading-relaxed text-stone-600">{faq.a}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
