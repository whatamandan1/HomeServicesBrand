import { DataTable } from "@/components/ui";
import type { SignupLeadSummary } from "@/lib/api";
import { signupLeadStepLabel } from "@/lib/signup-lead-session";

export function SignupLeadList({ leads }: { leads: SignupLeadSummary[] }) {
  if (leads.length === 0) {
    return (
      <p className="mt-2 text-sm text-stone-500">
        No incomplete signups right now — leads appear when someone enters contact details on /signup.
      </p>
    );
  }

  const rows = leads.map((lead) => ({
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
      emptyMessage="No incomplete signups."
    />
  );
}
