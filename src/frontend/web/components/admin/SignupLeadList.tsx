"use client";

import { useCallback } from "react";
import { DataTable } from "@/components/ui";
import { AdminListToolbar } from "@/components/admin/AdminListToolbar";
import type { SignupLeadSummary } from "@/lib/api";
import {
  DEFAULT_ADMIN_TABLE_PAGE_SIZE,
  matchesSearch,
  useAdminListControls,
} from "@/lib/admin-list-controls";
import { signupLeadStepLabel } from "@/lib/signup-lead-session";

function searchSignupLead(lead: SignupLeadSummary, query: string) {
  return matchesSearch(
    query,
    lead.firstName,
    lead.lastName,
    lead.email,
    lead.phone,
    signupLeadStepLabel(lead.lastStep),
    lead.selectedPlanName,
    lead.gardenSize,
    lead.postcode
  );
}

export function SignupLeadList({ leads }: { leads: SignupLeadSummary[] }) {
  const searchFn = useCallback(
    (lead: SignupLeadSummary, query: string) => searchSignupLead(lead, query),
    []
  );
  const controls = useAdminListControls(leads, searchFn, DEFAULT_ADMIN_TABLE_PAGE_SIZE);

  if (leads.length === 0) {
    return (
      <p className="mt-2 text-sm text-stone-500">
        No incomplete signups right now — leads appear when someone enters contact details on /signup.
      </p>
    );
  }

  const rows = controls.pageItems.map((lead) => ({
    name: [lead.firstName, lead.lastName].filter(Boolean).join(" "),
    email: lead.email,
    phone: lead.phone,
    step: signupLeadStepLabel(lead.lastStep),
    plan: lead.selectedPlanName ?? "—",
    garden: lead.gardenSize ?? "—",
    postcode: lead.postcode ?? "—",
    marketing: lead.marketingOptIn ? "Yes" : "No",
    started: new Date(lead.createdAtUtc).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    }),
  }));

  return (
    <div className="space-y-3">
      <AdminListToolbar
        controls={controls}
        placeholder="Search name, email, plan, postcode…"
      />
      <DataTable
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "step", label: "Last step" },
          { key: "plan", label: "Plan" },
          { key: "garden", label: "Garden" },
          { key: "postcode", label: "Postcode" },
          { key: "marketing", label: "Marketing" },
          { key: "started", label: "Started" },
        ]}
        rows={rows}
        emptyMessage={controls.query ? "No signups match your search." : "No incomplete signups."}
      />
    </div>
  );
}
