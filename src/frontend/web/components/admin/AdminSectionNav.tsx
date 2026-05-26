"use client";

const SECTIONS = [
  { id: "signup-leads", label: "Signups" },
  { id: "multi-property-solutions", label: "Leads" },
  { id: "providers", label: "Providers" },
  { id: "customers", label: "Customers" },
  { id: "visits", label: "Visits" },
  { id: "escalations", label: "Escalations" },
  { id: "workflow", label: "Workflow" },
  { id: "ai-log", label: "AI log" },
  { id: "threads", label: "Threads" },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function AdminSectionNav() {
  return (
    <nav
      aria-label="CRM sections"
      className="-mx-4 sticky top-[57px] z-40 border-b border-stone-200 bg-stone-50/95 px-4 py-2 backdrop-blur-md"
    >
      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => scrollToSection(section.id)}
            className="shrink-0 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs font-medium text-stone-700 transition hover:border-gardens-primary/40 hover:bg-gardens-light/30"
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
