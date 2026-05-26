using Sorted.Core.Enums;

namespace Sorted.Core.Dtos;

public record BrandResponse(Guid Id, string Code, string Name, string PrimaryDomain);

public record SubscriptionPlanResponse(
    Guid Id,
    string Name,
    string Description,
    SubscriptionBillingInterval BillingInterval,
    int MinimumTermMonths,
    decimal PriceGbp);

public record CheckoutSessionResponse(string SessionId, string Url);

public record SyncCheckoutRequest(string SessionId);

public record CustomerSubscriptionResponse(
    Guid Id,
    string PlanName,
    SubscriptionBillingInterval BillingInterval,
    SubscriptionStatus Status,
    DateTime? StartedAtUtc,
    string AvailabilityPreference,
    DateTime? MinimumTermEndsAtUtc,
    DateTime? CancelsAtUtc,
    bool CanManageBilling,
    bool CanUpgradeToPremium,
    string? PreferredGardenerName = null);

public record BillingPortalSessionResponse(string Url);

public record CancelSubscriptionResponse(DateTime CancelsAtUtc, string Message);

public record SwitchToAnnualBillingResponse(
    string PlanName,
    DateTime MinimumTermEndsAtUtc,
    string Message);

public record UpgradeSubscriptionResponse(
    string PlanName,
    DateTime MinimumTermEndsAtUtc,
    string Message);

public record CustomerPaymentResponse(
    Guid Id,
    string PlanName,
    decimal AmountGbp,
    PaymentStatus Status,
    DateTime PaidAtUtc,
    string? StripeInvoiceId);

public record CustomerPropertyResponse(
    Guid Id,
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize,
    string? AccessNotes,
    bool IsPrimary,
    int PhotoCount = 0);

public record PropertyMediaResponse(
    Guid Id,
    string FileName,
    string ContentType,
    int SizeBytes,
    DateTime UploadedAtUtc);

public record PropertyMediaListResponse(
    Guid PropertyId,
    IReadOnlyList<PropertyMediaResponse> Photos);

public record UpdateCustomerPropertyRequest(
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize,
    string? AccessNotes);

public record JobVisitResponse(
    Guid Id,
    DateTime ScheduledDate,
    string AvailabilityWindow,
    VisitStatus Status,
    string Postcode,
    string? AssignedProviderName,
    double? Latitude = null,
    double? Longitude = null);

public record ClaimVisitRequest(Guid VisitId);

public record TestNotificationsRequest(
    string Email,
    string? Phone = null,
    string FirstName = "Test");

public record RescheduleVisitRequest(DateTime ScheduledDate);

public record ProviderProfileResponse(
    string Email,
    bool IsApproved,
    string? CoveragePostcode,
    double CoverageRadiusMiles,
    IReadOnlyList<string> CoveredOutcodes,
    double? CoverageLatitude = null,
    double? CoverageLongitude = null);

public record UpdateProviderCoverageRequest(
    string CoveragePostcode,
    double CoverageRadiusMiles);

public record ProviderBlockedDateResponse(
    Guid Id,
    string BlockedDate,
    string? Reason,
    int ReleasedVisitCount = 0);

public record ProviderAvailabilityResponse(
    int WorkingDaysMask,
    string WorkDayStart,
    string WorkDayEnd,
    IReadOnlyList<ProviderBlockedDateResponse> BlockedDates);

public record UpdateProviderAvailabilityRequest(
    int WorkingDaysMask,
    string WorkDayStart,
    string WorkDayEnd);

public record AddProviderBlockedDateRequest(
    string BlockedDate,
    string? Reason);

public record ProviderEarningResponse(
    Guid Id,
    Guid JobVisitId,
    DateTime VisitDate,
    string Postcode,
    decimal AmountGbp,
    ProviderEarningStatus Status,
    DateTime? PaidAtUtc,
    string? PayoutNotes);

public record ProviderEarningsSummaryResponse(
    decimal AccruedTotalGbp,
    decimal PaidTotalGbp,
    IReadOnlyList<ProviderEarningResponse> Earnings);

public record MarkProviderEarningPaidRequest(string? Notes);

public record AdminProviderResponse(
    Guid Id,
    Guid UserId,
    string Email,
    string Name,
    bool IsApproved,
    string? CoveragePostcode,
    double CoverageRadiusMiles,
    double? CoverageLatitude,
    double? CoverageLongitude,
    IReadOnlyList<string> CoveredOutcodes);

public record SupportChatRequest(string Message, Guid? ThreadId);

public record SupportChatResponse(
    Guid ThreadId,
    string Reply,
    bool Escalated,
    double Confidence);

public record AdminDashboardTrendPoint(string Date, int Count);

public record AdminDashboardTrends(
    DateTime FromUtc,
    DateTime ToUtc,
    IReadOnlyList<AdminDashboardTrendPoint> NewCustomers,
    IReadOnlyList<AdminDashboardTrendPoint> NewSubscriptions,
    IReadOnlyList<AdminDashboardTrendPoint> CompletedVisits);

public record AdminDashboardResponse(
    int CustomerCount,
    int ActiveSubscriptions,
    int ProviderCount,
    int OpenVisits,
    int OpenEscalations,
    int NewPortfolioEnquiries,
    int ActiveSignupLeads,
    AdminDashboardTrends Trends);

public record AdminCustomerSubscriptionResponse(
    Guid Id,
    string PlanName,
    SubscriptionStatus Status,
    DateTime? StartedAtUtc,
    DateTime? MinimumTermEndsAtUtc,
    DateTime? CancelsAtUtc,
    bool HasStripeBilling,
    bool CanCancel,
    string AvailabilityPreference,
    string? PreferredGardenerName);

public record AdminCustomerDetailResponse(
    Guid Id,
    Guid UserId,
    string Email,
    string Name,
    string? Phone,
    DateTime CreatedAtUtc,
    IReadOnlyList<AdminCustomerSubscriptionResponse> Subscriptions,
    IReadOnlyList<CustomerPropertyResponse> Properties,
    IReadOnlyList<JobVisitResponse> RecentVisits);

public record EscalationResponse(
    Guid Id,
    string Reason,
    EscalationStatus Status,
    DateTime CreatedAtUtc,
    string? CustomerEmail,
    string? Notes);

public record ResolveEscalationRequest(string? Notes);

public record WorkflowEventResponse(
    Guid Id,
    string WorkflowName,
    string EventName,
    string? EntityType,
    Guid? EntityId,
    string PayloadJson,
    DateTime CreatedAtUtc);

public record AiActionLogResponse(
    Guid Id,
    Guid? CustomerId,
    string? CustomerEmail,
    string ActionType,
    string PromptSummary,
    string ResponseSummary,
    double? ConfidenceScore,
    bool Escalated,
    DateTime CreatedAtUtc);

public record AdminMessageResponse(
    Guid Id,
    string SenderRole,
    string Body,
    bool IsFromAi,
    DateTime CreatedAtUtc);

public record CommunicationThreadSummaryResponse(
    Guid Id,
    Guid? CustomerId,
    string? CustomerEmail,
    string Subject,
    int MessageCount,
    string? LastMessagePreview,
    DateTime CreatedAtUtc);

public record CommunicationThreadDetailResponse(
    Guid Id,
    Guid? CustomerId,
    string? CustomerEmail,
    string Subject,
    IReadOnlyList<AdminMessageResponse> Messages);

public record SubmitPortfolioEnquiryPropertyRequest(
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize);

public record SubmitPortfolioEnquiryRequest(
    string ContactName,
    string Email,
    string Phone,
    string? CompanyName,
    string? Notes,
    string BrandCode,
    IReadOnlyList<SubmitPortfolioEnquiryPropertyRequest> Properties);

public record PortfolioEnquirySubmittedResponse(
    Guid EnquiryId,
    string Message);

public record PortfolioEnquiryPropertyResponse(
    Guid Id,
    int SortOrder,
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize);

public record PortfolioEnquirySummaryResponse(
    Guid Id,
    string ContactName,
    string Email,
    string Phone,
    string? CompanyName,
    PortfolioEnquiryStatus Status,
    int PropertyCount,
    DateTime CreatedAtUtc);

public record PortfolioEnquiryDetailResponse(
    Guid Id,
    string ContactName,
    string Email,
    string Phone,
    string? CompanyName,
    string? Notes,
    PortfolioEnquiryStatus Status,
    DateTime CreatedAtUtc,
    IReadOnlyList<PortfolioEnquiryPropertyResponse> Properties);

public record UpdatePortfolioEnquiryStatusRequest(PortfolioEnquiryStatus Status);

public record CaptureSignupLeadRequest(
    string Email,
    string Phone,
    string FirstName,
    string? LastName,
    bool MarketingOptIn,
    int LastStep,
    string? SelectedPlanName,
    GardenSize? GardenSize,
    string? Postcode,
    string? SessionId,
    string BrandCode = "gardens-sorted");

public record CaptureSignupLeadResponse(Guid LeadId, bool Saved);

public record SignupLeadSummaryResponse(
    Guid Id,
    string FirstName,
    string? LastName,
    string Email,
    string Phone,
    bool MarketingOptIn,
    int LastStep,
    string? SelectedPlanName,
    GardenSize? GardenSize,
    string? Postcode,
    SignupLeadStatus Status,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);

public record LandlordPropertyResponse(
    Guid Id,
    int SortOrder,
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize,
    string VisitFrequency,
    string ServiceLevel,
    DateTime? NextVisitDate);

public record LandlordAccountResponse(
    Guid Id,
    string ContactName,
    string Email,
    string? Phone,
    string? CompanyName,
    decimal? IndicativeMonthlyGbp,
    string? AgreementNotes,
    IReadOnlyList<LandlordPropertyResponse> Properties);
