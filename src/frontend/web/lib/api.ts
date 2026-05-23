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
  impersonatorUserId?: string | null;
  impersonatorEmail?: string | null;
};

export type CustomerSubscription = {
  id: string;
  planName: string;
  billingInterval: string;
  status: string;
  startedAtUtc: string | null;
  availabilityPreference: string;
  minimumTermEndsAtUtc: string | null;
  cancelsAtUtc: string | null;
  canManageBilling: boolean;
  canUpgradeToPremium: boolean;
  preferredGardenerName?: string | null;
};

export type CustomerPayment = {
  id: string;
  planName: string;
  amountGbp: number;
  status: string;
  paidAtUtc: string;
  stripeInvoiceId: string | null;
};

export type GardenSize = "Small" | "Medium" | "Large";

export type CustomerProperty = {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  gardenSize: GardenSize;
  accessNotes: string | null;
  isPrimary: boolean;
  photoCount?: number;
};

export type PropertyMedia = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAtUtc: string;
};

export type AdminDashboardTrendPoint = {
  date: string;
  count: number;
};

export type AdminDashboard = {
  customerCount: number;
  activeSubscriptions: number;
  providerCount: number;
  openVisits: number;
  openEscalations: number;
  trends: {
    fromUtc: string;
    toUtc: string;
    newCustomers: AdminDashboardTrendPoint[];
    newSubscriptions: AdminDashboardTrendPoint[];
    completedVisits: AdminDashboardTrendPoint[];
  };
};

export type JobVisit = {
  id: string;
  scheduledDate: string;
  availabilityWindow: string;
  status: string;
  postcode: string;
  assignedProviderName: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type AdminCustomer = {
  id: string;
  userId: string;
  email: string;
  name: string;
  createdAtUtc: string;
};

export type AdminCustomerSubscription = {
  id: string;
  planName: string;
  status: string;
  startedAtUtc: string | null;
  minimumTermEndsAtUtc: string | null;
  cancelsAtUtc: string | null;
  hasStripeBilling: boolean;
  canCancel: boolean;
};

export type AdminCustomerDetail = {
  id: string;
  userId: string;
  email: string;
  name: string;
  phone: string | null;
  createdAtUtc: string;
  subscriptions: AdminCustomerSubscription[];
  properties: CustomerProperty[];
  recentVisits: JobVisit[];
};

export type AdminProvider = {
  id: string;
  userId: string;
  email: string;
  name: string;
  isApproved: boolean;
  coveragePostcode: string | null;
  coverageRadiusMiles: number;
  coverageLatitude: number | null;
  coverageLongitude: number | null;
  coveredOutcodes: string[];
};

export type ProviderProfile = {
  email: string;
  isApproved: boolean;
  coveragePostcode: string | null;
  coverageRadiusMiles: number;
  coverageLatitude: number | null;
  coverageLongitude: number | null;
  coveredOutcodes: string[];
};

export type ProviderBlockedDate = {
  id: string;
  blockedDate: string;
  reason: string | null;
  releasedVisitCount?: number;
};

export type ProviderAvailability = {
  workingDaysMask: number;
  workDayStart: string;
  workDayEnd: string;
  blockedDates: ProviderBlockedDate[];
};

export type Escalation = {
  id: string;
  reason: string;
  status: string;
  createdAtUtc: string;
  customerEmail: string | null;
  notes: string | null;
};

export type WorkflowEvent = {
  id: string;
  workflowName: string;
  eventName: string;
  entityType: string | null;
  entityId: string | null;
  payloadJson: string;
  createdAtUtc: string;
};

export type AiActionLog = {
  id: string;
  customerId: string | null;
  customerEmail: string | null;
  actionType: string;
  promptSummary: string;
  responseSummary: string;
  confidenceScore: number | null;
  escalated: boolean;
  createdAtUtc: string;
};

export type CommunicationThreadSummary = {
  id: string;
  customerId: string | null;
  customerEmail: string | null;
  subject: string;
  messageCount: number;
  lastMessagePreview: string | null;
  createdAtUtc: string;
};

export type AdminMessage = {
  id: string;
  senderRole: string;
  body: string;
  isFromAi: boolean;
  createdAtUtc: string;
};

export type CommunicationThreadDetail = {
  id: string;
  customerId: string | null;
  customerEmail: string | null;
  subject: string;
  messages: AdminMessage[];
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
    if (res.status === 401 && typeof window !== "undefined") {
      const { clearAuth } = await import("./auth-storage");
      clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
      }
    }
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
    if (res.status >= 500 && !text.trim()) {
      message =
        "The server took too long or encountered an error. If you already submitted, try logging in.";
    }
    throw new Error(message || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function uploadForm<T>(path: string, file: File, token: string): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    let message = res.statusText;
    try {
      const err = JSON.parse(text) as { error?: string };
      message = err.error ?? message;
    } catch {
      if (text && !text.startsWith("<")) message = text.slice(0, 200);
    }
    throw new Error(message || "Upload failed");
  }
  return res.json() as Promise<T>;
}

async function fetchBlob(path: string, token: string): Promise<Blob> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Could not load photo");
  return res.blob();
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
    coveragePostcode: string;
    coverageRadiusMiles: number;
  }) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    return request<AuthResponse>(
      "/api/auth/register/provider",
      {
        method: "POST",
        body: JSON.stringify(body),
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeout));
  },
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  forgotPassword: (email: string) =>
    request<{ message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
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
  customerPayments: (token: string) =>
    request<CustomerPayment[]>("/api/customer/payments", {}, token),
  customerUpgradeToPremium: (token: string, subscriptionId: string) =>
    request<{ planName: string; minimumTermEndsAtUtc: string; message: string }>(
      `/api/customer/subscriptions/${subscriptionId}/upgrade`,
      { method: "POST" },
      token
    ),
  customerSwitchToAnnual: (token: string, subscriptionId: string) =>
    request<{ planName: string; minimumTermEndsAtUtc: string; message: string }>(
      `/api/customer/subscriptions/${subscriptionId}/switch-to-annual`,
      { method: "POST" },
      token
    ),
  customerBillingPortal: (token: string, subscriptionId: string) =>
    request<{ url: string }>(
      `/api/customer/subscriptions/${subscriptionId}/billing-portal`,
      { method: "POST" },
      token
    ),
  customerSyncCheckout: (token: string, sessionId: string) =>
    request<{ message: string }>(
      "/api/customer/subscriptions/sync-checkout",
      { method: "POST", body: JSON.stringify({ sessionId }) },
      token
    ),
  customerProperties: (token: string) =>
    request<CustomerProperty[]>("/api/customer/properties", {}, token),
  customerUpdateProperty: (
    token: string,
    propertyId: string,
    body: {
      line1: string;
      line2: string | null;
      city: string;
      postcode: string;
      gardenSize: GardenSize;
      accessNotes: string | null;
    }
  ) =>
    request<CustomerProperty>(`/api/customer/properties/${propertyId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, token),
  customerPropertyPhotos: async (token: string, propertyId: string) => {
    const res = await request<{ propertyId: string; photos: PropertyMedia[] }>(
      `/api/customer/properties/${propertyId}/photos`,
      {},
      token
    );
    return res.photos;
  },
  customerUploadPropertyPhoto: (token: string, propertyId: string, file: File) =>
    uploadForm<PropertyMedia>(`/api/customer/properties/${propertyId}/photos`, file, token),
  customerDeletePropertyPhoto: (token: string, photoId: string) =>
    request<void>(`/api/customer/properties/photos/${photoId}`, { method: "DELETE" }, token),
  customerFetchPropertyPhoto: (token: string, photoId: string) =>
    fetchBlob(`/api/customer/properties/photos/${photoId}`, token),
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
  providerUpdateCoverage: (
    token: string,
    coveragePostcode: string,
    coverageRadiusMiles: number
  ) =>
    request<ProviderProfile>("/api/provider/me/coverage", {
      method: "PATCH",
      body: JSON.stringify({ coveragePostcode, coverageRadiusMiles }),
    }, token),
  providerAvailability: (token: string) =>
    request<ProviderAvailability>("/api/provider/me/availability", {}, token),
  providerUpdateAvailability: (
    token: string,
    body: { workingDaysMask: number; workDayStart: string; workDayEnd: string }
  ) =>
    request<ProviderAvailability>("/api/provider/me/availability", {
      method: "PUT",
      body: JSON.stringify(body),
    }, token),
  providerAddBlockedDate: (
    token: string,
    body: { blockedDate: string; reason: string | null }
  ) =>
    request<ProviderBlockedDate>("/api/provider/me/blocked-dates", {
      method: "POST",
      body: JSON.stringify(body),
    }, token),
  providerRemoveBlockedDate: (token: string, blockedDateId: string) =>
    request<void>(`/api/provider/me/blocked-dates/${blockedDateId}`, { method: "DELETE" }, token),
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
  adminDashboard: (token: string, days = 30) =>
    request<AdminDashboard>(`/api/admin/dashboard?days=${days}`, {}, token),
  adminCustomers: (token: string) =>
    request<AdminCustomer[]>("/api/admin/customers", {}, token),
  adminCustomerDetail: (token: string, customerId: string) =>
    request<AdminCustomerDetail>(`/api/admin/customers/${customerId}`, {}, token),
  adminCancelSubscription: (token: string, subscriptionId: string) =>
    request<{ cancelsAtUtc: string; message: string }>(
      `/api/admin/subscriptions/${subscriptionId}/cancel`,
      { method: "POST" },
      token
    ),
  adminImpersonate: (token: string, userId: string) =>
    request<AuthResponse>(`/api/admin/users/${userId}/impersonate`, { method: "POST" }, token),
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
  adminUpdateProviderCoverage: (
    token: string,
    providerId: string,
    coveragePostcode: string,
    coverageRadiusMiles: number
  ) =>
    request<AdminProvider>(`/api/admin/providers/${providerId}/coverage`, {
      method: "PATCH",
      body: JSON.stringify({ coveragePostcode, coverageRadiusMiles }),
    }, token),
  adminCustomerCommunicationThreads: (token: string, customerId: string, limit = 20) =>
    request<CommunicationThreadSummary[]>(
      `/api/admin/customers/${customerId}/communication-threads?limit=${limit}`,
      {},
      token
    ),
  adminOpenDispatch: (token: string) =>
    request<void>("/api/admin/scheduling/open-dispatch", { method: "POST" }, token),
  adminWorkflowEvents: (token: string, workflow?: string, limit = 100) => {
    const params = new URLSearchParams();
    if (workflow) params.set("workflow", workflow);
    params.set("limit", String(limit));
    const qs = params.toString();
    return request<WorkflowEvent[]>(
      `/api/admin/workflow-events${qs ? `?${qs}` : ""}`,
      {},
      token
    );
  },
  adminAiActions: (token: string, actionType?: string, escalatedOnly = false, limit = 100) => {
    const params = new URLSearchParams();
    if (actionType) params.set("actionType", actionType);
    if (escalatedOnly) params.set("escalatedOnly", "true");
    params.set("limit", String(limit));
    const qs = params.toString();
    return request<AiActionLog[]>(`/api/admin/ai-actions?${qs}`, {}, token);
  },
  adminCommunicationThreads: (token: string, limit = 50) =>
    request<CommunicationThreadSummary[]>(
      `/api/admin/communication-threads?limit=${limit}`,
      {},
      token
    ),
  adminCommunicationThread: (token: string, id: string) =>
    request<CommunicationThreadDetail>(`/api/admin/communication-threads/${id}`, {}, token),
};
