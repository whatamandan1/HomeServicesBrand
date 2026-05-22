function resolveApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  // Same-origin requests proxied to the backend via next.config rewrites.
  return "";
}

const API_BASE = resolveApiBase();

export type AuthResponse = {
  token: string;
  expiresAtUtc: string;
  userId: string;
  email: string;
  role: "Customer" | "Provider" | "Admin";
  brandCode: string | null;
  pendingSubscriptionId?: string | null;
};

export type CustomerSubscription = {
  id: string;
  planName: string;
  status: string;
  startedAtUtc: string | null;
  availabilityPreference: string;
};

export type JobVisit = {
  id: string;
  scheduledDate: string;
  availabilityWindow: string;
  status: string;
  postcode: string;
  assignedProviderName: string | null;
};

export type AdminCustomer = {
  id: string;
  email: string;
  name: string;
  createdAtUtc: string;
};

export type AdminProvider = {
  id: string;
  email: string;
  name: string;
  isApproved: boolean;
  sectors: string[];
};

export type ProviderProfile = {
  email: string;
  isApproved: boolean;
  postcodeSectors: string[];
};

export type Escalation = {
  id: string;
  reason: string;
  status: string;
  createdAtUtc: string;
  customerEmail: string | null;
  notes: string | null;
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  billingInterval: string;
  minimumTermMonths: number;
  priceGbp: number;
};

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText;
    try {
      const err = JSON.parse(text) as {
        error?: string;
        title?: string;
        errors?: Record<string, string[]>;
      };
      if (err.errors && Object.keys(err.errors).length > 0) {
        message = Object.entries(err.errors)
          .flatMap(([field, messages]) =>
            messages.map((m) => {
              const label = field === "$" || field.startsWith("$.") ? "request" : field;
              return `${label}: ${m}`;
            })
          )
          .join(" ");
      } else {
        message = err.error ?? err.title ?? message;
      }
    } catch {
      if (text && !text.startsWith("<")) message = text.slice(0, 200);
    }
    if (res.status === 403) {
      message =
        "Access denied — you may be logged in with the wrong account (customer vs admin vs provider).";
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  getPublicConfig: () =>
    request<{ bypassStripeCheckout: boolean }>("/api/config/public"),
  getPlans: () =>
    request<SubscriptionPlan[]>("/api/brands/gardens-sorted/plans"),
  registerCustomer: (body: unknown) =>
    request<AuthResponse>("/api/auth/register/customer", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  registerProvider: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    postcodeSectors: string[];
  }) =>
    request<AuthResponse>("/api/auth/register/provider", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  checkout: (subscriptionId: string, token: string) =>
    request<{ sessionId: string; url: string }>(
      `/api/customer/subscriptions/${subscriptionId}/checkout`,
      { method: "POST" },
      token
    ),
  devActivate: (subscriptionId: string) =>
    request<{ message: string }>(
      `/api/dev/activate-subscription/${subscriptionId}`,
      { method: "POST" }
    ),
  customerSubscriptions: (token: string) =>
    request<CustomerSubscription[]>("/api/customer/subscriptions", {}, token),
  customerVisits: (token: string) =>
    request<JobVisit[]>("/api/customer/visits", {}, token),
  customerCancelVisit: (token: string, visitId: string) =>
    request<JobVisit>(`/api/customer/visits/${visitId}/cancel`, { method: "POST" }, token),
  customerRescheduleVisit: (token: string, visitId: string, scheduledDate: string) =>
    request<JobVisit>(`/api/customer/visits/${visitId}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledDate }),
    }, token),
  supportChat: (token: string, message: string, threadId?: string) =>
    request<{ threadId: string; reply: string; escalated: boolean }>(
      "/api/customer/support/chat",
      { method: "POST", body: JSON.stringify({ message, threadId }) },
      token
    ),
  guestSupportChat: (message: string, threadId?: string) =>
    request<{ threadId: string; reply: string; escalated: boolean; confidence?: number }>(
      "/api/support/chat",
      { method: "POST", body: JSON.stringify({ message, threadId }) }
    ),
  providerOpenVisits: (token: string) =>
    request<JobVisit[]>("/api/provider/visits/open", {}, token),
  providerProfile: (token: string) =>
    request<ProviderProfile>("/api/provider/me", {}, token),
  providerMyVisits: (token: string) =>
    request<JobVisit[]>("/api/provider/visits/mine", {}, token),
  claimVisit: (token: string, visitId: string) =>
    request<JobVisit>("/api/provider/visits/claim", {
      method: "POST",
      body: JSON.stringify({ visitId }),
    }, token),
  startVisit: (token: string, visitId: string) =>
    request<JobVisit>(`/api/provider/visits/${visitId}/start`, { method: "POST" }, token),
  completeVisit: (token: string, visitId: string) =>
    request<JobVisit>(`/api/provider/visits/${visitId}/complete`, { method: "POST" }, token),
  adminDashboard: (token: string) =>
    request<{
      customerCount: number;
      activeSubscriptions: number;
      providerCount: number;
      openVisits: number;
      openEscalations: number;
    }>("/api/admin/dashboard", {}, token),
  adminCustomers: (token: string) =>
    request<AdminCustomer[]>("/api/admin/customers", {}, token),
  adminProviders: (token: string) =>
    request<AdminProvider[]>("/api/admin/providers", {}, token),
  adminVisits: (token: string) =>
    request<JobVisit[]>("/api/admin/visits", {}, token),
  adminCancelVisit: (token: string, visitId: string) =>
    request<JobVisit>(`/api/admin/visits/${visitId}/cancel`, { method: "POST" }, token),
  adminRescheduleVisit: (token: string, visitId: string, scheduledDate: string) =>
    request<JobVisit>(`/api/admin/visits/${visitId}/reschedule`, {
      method: "POST",
      body: JSON.stringify({ scheduledDate }),
    }, token),
  adminEscalations: (token: string) =>
    request<Escalation[]>("/api/admin/escalations", {}, token),
  adminStartEscalation: (token: string, id: string) =>
    request<Escalation>(`/api/admin/escalations/${id}/start`, { method: "POST" }, token),
  adminResolveEscalation: (token: string, id: string, notes?: string) =>
    request<Escalation>(`/api/admin/escalations/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ notes: notes ?? null }),
    }, token),
  approveProvider: (token: string, id: string) =>
    request<void>(`/api/admin/providers/${id}/approve`, { method: "POST" }, token),
  adminOpenDispatch: (token: string) =>
    request<void>("/api/admin/scheduling/open-dispatch", { method: "POST" }, token),
};
