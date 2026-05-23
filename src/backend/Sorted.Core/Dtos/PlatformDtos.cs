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

public record CustomerSubscriptionResponse(
    Guid Id,
    string PlanName,
    SubscriptionStatus Status,
    DateTime? StartedAtUtc,
    string AvailabilityPreference);

public record CustomerPropertyResponse(
    Guid Id,
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize,
    string? AccessNotes,
    bool IsPrimary);

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

public record SupportChatRequest(string Message, Guid? ThreadId);

public record SupportChatResponse(
    Guid ThreadId,
    string Reply,
    bool Escalated,
    double Confidence);

public record AdminDashboardResponse(
    int CustomerCount,
    int ActiveSubscriptions,
    int ProviderCount,
    int OpenVisits,
    int OpenEscalations);

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
