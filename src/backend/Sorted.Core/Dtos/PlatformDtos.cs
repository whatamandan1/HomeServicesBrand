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

public record JobVisitResponse(
    Guid Id,
    DateTime ScheduledDate,
    string AvailabilityWindow,
    VisitStatus Status,
    string Postcode,
    string? AssignedProviderName);

public record ClaimVisitRequest(Guid VisitId);

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

public record EscalationResponse(Guid Id, string Reason, EscalationStatus Status, DateTime CreatedAtUtc);
