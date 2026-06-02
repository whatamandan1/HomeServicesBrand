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
  role: "Customer" | "Provider" | "Admin" | "Landlord";
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

export type GardenSizeSuggestion = {
  suggestedSize: GardenSize;
  estimatedMaintainedSqm: number;
  confidence: number;
  source: string;
  disclaimer: string;
  requiresPersonalisedQuote: boolean;
};

export type PortfolioEnquiryStatus =
  | "New"
  | "Quoted"
  | "UnderReview"
  | "Accepted"
  | "Active"
  | "Closed";

export type PortfolioEnquiryPropertyInput = {
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  gardenSize: GardenSize;
};

export type PortfolioEnquirySummary = {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  companyName: string | null;
  status: PortfolioEnquiryStatus;
  propertyCount: number;
  createdAtUtc: string;
};

export type SignupLeadSummary = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string;
  marketingOptIn: boolean;
  lastStep: number;
  selectedPlanName: string | null;
  gardenSize: GardenSize | null;
  postcode: string | null;
  status: "Active" | "Converted";
  createdAtUtc: string;
  updatedAtUtc: string | null;
};

export type PortfolioEnquiryDetail = {
  id: string;
  contactName: string;
  email: string;
  phone: string;
  companyName: string | null;
  notes: string | null;
  status: PortfolioEnquiryStatus;
  createdAtUtc: string;
  properties: Array<{
    id: string;
    sortOrder: number;
    line1: string;
    line2: string | null;
    city: string;
    postcode: string;
    gardenSize: GardenSize;
  }>;
};

export type LandlordProperty = {
  id: string;
  sortOrder: number;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  gardenSize: GardenSize;
  visitFrequency: string;
  serviceLevel: string;
  nextVisitDate: string | null;
};

export type LandlordAccount = {
  id: string;
  contactName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  indicativeMonthlyGbp: number | null;
  agreementNotes: string | null;
  properties: LandlordProperty[];
};

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
  newPortfolioEnquiries: number;
  activeSignupLeads: number;
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
  availabilityPreference: string;
  preferredGardenerName: string | null;
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

export type ProviderVettingStatus = {
  isSubmitted: boolean;
  isComplete: boolean;
  hasIdPhoto: boolean;
  idVerified: boolean;
  rightToWorkVerified: boolean;
  dbsVerified: boolean;
  insuranceVerified: boolean;
  submittedAtUtc: string | null;
};

export type ProviderIdPhoto = {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  createdAtUtc: string;
};

export type ProviderVettingDetails = {
  status: ProviderVettingStatus;
  dateOfBirth: string | null;
  idDocumentType: string | null;
  idDocumentNumber: string | null;
  rightToWorkShareCode: string | null;
  rightToWorkDocumentDescription: string | null;
  dbsCertificateNumber: string | null;
  dbsIssueDate: string | null;
  dbsOnUpdateService: boolean;
  hasLeafBlower: boolean;
  hasHedgeTrimmer: boolean;
  hasPressureWasherForPatio: boolean;
  hasOwnRelevantInsurance: boolean;
};

export type SubmitProviderVettingPayload = {
  dateOfBirth: string;
  idDocumentType: string;
  idDocumentNumber: string;
  rightToWorkShareCode: string | null;
  rightToWorkDocumentDescription: string | null;
  dbsCertificateNumber: string;
  dbsIssueDate: string;
  dbsOnUpdateService: boolean;
  hasLeafBlower: boolean;
  hasHedgeTrimmer: boolean;
  hasPressureWasherForPatio: boolean;
  hasOwnRelevantInsurance: boolean;
};

export type AdminProviderVetting = ProviderVettingDetails & {
  providerId: string;
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
  vetting: ProviderVettingStatus;
};

export type ProviderProfile = {
  email: string;
  isApproved: boolean;
  coveragePostcode: string | null;
  coverageRadiusMiles: number;
  coverageLatitude: number | null;
  coverageLongitude: number | null;
  coveredOutcodes: string[];
  vetting: ProviderVettingStatus;
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

export type ProviderEarning = {
  id: string;
  jobVisitId: string;
  visitDate: string;
  postcode: string;
  amountGbp: number;
  status: "Accrued" | "Paid" | "Cancelled";
  paidAtUtc: string | null;
  payoutNotes: string | null;
};

export type ProviderEarningsSummary = {
  accruedTotalGbp: number;
  paidTotalGbp: number;
  earnings: ProviderEarning[];
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
        "Access denied - you may be logged in with the wrong account (customer, provider, landlord, or admin).";
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
  suggestGardenSize: (body: {
    postcode: string;
    line1?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }) =>
    request<GardenSizeSuggestion | undefined>("/api/geo/garden-size-suggest", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  captureSignupLead: (body: {
    email: string;
    phone: string;
    firstName: string;
    lastName?: string | null;
    marketingOptIn: boolean;
    lastStep: number;
    selectedPlanName?: string | null;
    gardenSize?: GardenSize | null;
    postcode?: string | null;
    sessionId?: string | null;
  }) =>
    request<{ leadId: string; saved: boolean }>("/api/marketing/signup-leads", {
      method: "POST",
      body: JSON.stringify(body),
    }),
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
  providerVetting: (token: string) =>
    request<ProviderVettingDetails>("/api/provider/me/vetting", {}, token),
  providerSubmitVetting: (token: string, body: SubmitProviderVettingPayload) =>
    request<ProviderVettingDetails>("/api/provider/me/vetting", {
      method: "PUT",
      body: JSON.stringify(body),
    }, token),
  providerIdPhoto: async (token: string) => {
    const res = await fetch(`${API_BASE}/api/provider/me/vetting/id-photo`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText || "Could not load ID photo");
    }
    return res.json() as Promise<ProviderIdPhoto>;
  },
  providerUploadIdPhoto: (token: string, file: File) =>
    uploadForm<ProviderIdPhoto>("/api/provider/me/vetting/id-photo", file, token),
  providerDeleteIdPhoto: (token: string) =>
    request<void>("/api/provider/me/vetting/id-photo", { method: "DELETE" }, token),
  providerFetchIdPhotoBlob: (token: string) =>
    fetchBlob("/api/provider/me/vetting/id-photo/file", token),
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
  providerEarnings: (token: string) =>
    request<ProviderEarningsSummary>("/api/provider/earnings", {}, token),
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
  adminProviderVetting: (token: string, providerId: string) =>
    request<AdminProviderVetting>(`/api/admin/providers/${providerId}/vetting`, {}, token),
  adminFetchProviderIdPhotoBlob: (token: string, providerId: string) =>
    fetchBlob(`/api/admin/providers/${providerId}/vetting/id-photo/file`, token),
  adminUpdateProviderVettingVerification: (
    token: string,
    providerId: string,
    body: {
      idVerified?: boolean;
      rightToWorkVerified?: boolean;
      dbsVerified?: boolean;
      insuranceVerified?: boolean;
    }
  ) =>
    request<AdminProviderVetting>(`/api/admin/providers/${providerId}/vetting`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }, token),
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
  adminProviderAvailability: (token: string, providerId: string) =>
    request<ProviderAvailability>(`/api/admin/providers/${providerId}/availability`, {}, token),
  adminUpdateProviderAvailability: (
    token: string,
    providerId: string,
    body: { workingDaysMask: number; workDayStart: string; workDayEnd: string }
  ) =>
    request<ProviderAvailability>(`/api/admin/providers/${providerId}/availability`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, token),
  adminAddProviderBlockedDate: (
    token: string,
    providerId: string,
    body: { blockedDate: string; reason: string | null }
  ) =>
    request<ProviderBlockedDate>(`/api/admin/providers/${providerId}/blocked-dates`, {
      method: "POST",
      body: JSON.stringify(body),
    }, token),
  adminRemoveProviderBlockedDate: (token: string, providerId: string, blockedDateId: string) =>
    request<void>(
      `/api/admin/providers/${providerId}/blocked-dates/${blockedDateId}`,
      { method: "DELETE" },
      token
    ),
  adminProviderEarnings: (token: string, providerId: string) =>
    request<ProviderEarningsSummary>(`/api/admin/providers/${providerId}/earnings`, {}, token),
  adminMarkProviderEarningPaid: (
    token: string,
    providerId: string,
    earningId: string,
    notes?: string | null
  ) =>
    request<ProviderEarning>(
      `/api/admin/providers/${providerId}/earnings/${earningId}/mark-paid`,
      { method: "POST", body: JSON.stringify({ notes: notes ?? null }) },
      token
    ),
  adminCustomerPropertyPhotos: async (
    token: string,
    customerId: string,
    propertyId: string
  ) => {
    const res = await request<{ propertyId: string; photos: PropertyMedia[] }>(
      `/api/admin/customers/${customerId}/properties/${propertyId}/photos`,
      {},
      token
    );
    return res.photos;
  },
  adminFetchPropertyPhoto: (token: string, photoId: string) =>
    fetchBlob(`/api/admin/properties/photos/${photoId}`, token),
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
  submitPortfolioEnquiry: (body: {
    contactName: string;
    email: string;
    phone: string;
    companyName?: string;
    notes?: string;
    brandCode: string;
    properties: PortfolioEnquiryPropertyInput[];
  }) =>
    request<{ enquiryId: string; message: string }>("/api/portfolios/enquiries", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  adminPortfolioEnquiries: (token: string) =>
    request<PortfolioEnquirySummary[]>("/api/admin/portfolios/enquiries", {}, token),
  adminSignupLeads: (token: string) =>
    request<SignupLeadSummary[]>("/api/admin/signup-leads", {}, token),
  adminPortfolioEnquiry: (token: string, id: string) =>
    request<PortfolioEnquiryDetail>(`/api/admin/portfolios/enquiries/${id}`, {}, token),
  adminUpdatePortfolioEnquiryStatus: (token: string, id: string, status: PortfolioEnquiryStatus) =>
    request<PortfolioEnquiryDetail>(`/api/admin/portfolios/enquiries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }, token),
  landlordAccount: (token: string) =>
    request<LandlordAccount>("/api/landlord/account", {}, token),
};
