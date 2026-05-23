using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Geo;

namespace Sorted.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default);
    Task<AuthResponse> RegisterProviderAsync(RegisterProviderRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task RequestPasswordResetAsync(string email, CancellationToken ct = default);
    Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default);
    Task<AuthResponse> ImpersonateAsync(Guid targetUserId, Guid adminUserId, string adminEmail, CancellationToken ct = default);
}

public interface IStripePaymentService
{
    Task<CheckoutSessionResponse> CreateSignupCheckoutAsync(CustomerSubscription subscription, SubscriptionPlan plan, string customerEmail, CancellationToken ct = default);
    Task<BillingPortalSessionResponse> CreateBillingPortalSessionAsync(CustomerSubscription subscription, CancellationToken ct = default);
    Task<CancelSubscriptionResponse> CancelSubscriptionAsync(CustomerSubscription subscription, CancellationToken ct = default);
    Task<SwitchToAnnualBillingResponse> SwitchToAnnualBillingAsync(CustomerSubscription subscription, CancellationToken ct = default);
    Task<UpgradeSubscriptionResponse> UpgradeToPremiumAsync(CustomerSubscription subscription, CancellationToken ct = default);
    Task HandleWebhookAsync(string json, string stripeSignature, CancellationToken ct = default);
    Task SyncCheckoutSessionAsync(Guid customerUserId, string checkoutSessionId, CancellationToken ct = default);
}

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string firstName, CancellationToken ct = default);
    Task SendSubscriptionConfirmedEmailAsync(string toEmail, string planName, CancellationToken ct = default);
    Task SendVisitClaimedEmailAsync(string toEmail, DateTime visitDate, string postcode, string availabilityWindow, CancellationToken ct = default);
    Task SendVisitReminderEmailAsync(string toEmail, DateTime visitDate, string postcode, string availabilityWindow, CancellationToken ct = default);
    Task SendPasswordResetEmailAsync(string toEmail, string resetUrl, CancellationToken ct = default);
}

public interface ISmsService
{
    Task SendWelcomeSmsAsync(string toPhone, string firstName, CancellationToken ct = default);
    Task SendSubscriptionConfirmedSmsAsync(string toPhone, string planName, CancellationToken ct = default);
    Task SendVisitClaimedSmsAsync(string toPhone, DateTime visitDate, string postcode, CancellationToken ct = default);
    Task SendVisitReminderSmsAsync(string toPhone, DateTime visitDate, string postcode, CancellationToken ct = default);
}

public interface IAiSupportService
{
    Task<SupportChatResponse> ChatAsync(Guid customerId, SupportChatRequest request, CancellationToken ct = default);
    Task<SupportChatResponse> GuestChatAsync(SupportChatRequest request, CancellationToken ct = default);
}

public interface IVisitSchedulingService
{
    Task GenerateVisitsForSubscriptionAsync(Guid subscriptionId, int count = 4, CancellationToken ct = default);
    Task OpenVisitsForDispatchAsync(CancellationToken ct = default);
    Task TopUpFutureVisitsAsync(int targetCount = 4, CancellationToken ct = default);
    Task OpenUpcomingVisitsForDispatchAsync(int withinDays = 14, CancellationToken ct = default);
    Task ExpireStaleDispatchOffersAsync(int renewalExpiryDays = 3, CancellationToken ct = default);
    Task SendDueVisitRemindersAsync(int leadHours = 24, CancellationToken ct = default);
    Task AssignPreferredProviderToPendingVisitsAsync(Guid subscriptionId, CancellationToken ct = default);
}

public interface IVisitManagementService
{
    Task<JobVisitResponse> CancelVisitAsync(Guid visitId, Guid? owningCustomerId, bool allowInProgress, CancellationToken ct = default);
    Task<JobVisitResponse> RescheduleVisitAsync(Guid visitId, DateTime scheduledDate, Guid? owningCustomerId, bool allowInProgress, CancellationToken ct = default);
}

public interface IPostcodeGeocodingService
{
    Task<GeocodedPostcode?> LookupAsync(string postcode, CancellationToken ct = default);
    Task<IReadOnlyList<GeocodedPostcode>> NearPointAsync(
        double latitude,
        double longitude,
        int radiusMeters,
        int limit,
        CancellationToken ct = default);
    Task<IReadOnlyList<GeocodedPostcode>> NearestPostcodesAsync(
        string postcode,
        int radiusMeters,
        int limit,
        CancellationToken ct = default);
}

public interface IProviderCoverageService
{
    Task SyncTerritoriesAsync(Provider provider, CancellationToken ct = default);
    void ScheduleTerritorySync(Guid providerId);
    void ScheduleTerritoryResync(Guid providerId);
    Task<bool> IsPropertyWithinCoverageAsync(Provider provider, CustomerProperty property, CancellationToken ct = default);
}

public interface IProviderAvailabilityService
{
    Task<bool> IsAvailableAsync(Provider provider, DateTime scheduledDate, CancellationToken ct = default);
    Task<ProviderAvailabilityResponse> GetAvailabilityAsync(Guid providerId, CancellationToken ct = default);
    Task<ProviderAvailabilityResponse> UpdateAvailabilityAsync(
        Guid providerId,
        UpdateProviderAvailabilityRequest request,
        CancellationToken ct = default);
    Task<ProviderBlockedDateResponse> AddBlockedDateAsync(
        Guid providerId,
        AddProviderBlockedDateRequest request,
        CancellationToken ct = default);
    Task RemoveBlockedDateAsync(Guid providerId, Guid blockedDateId, CancellationToken ct = default);
}

public interface IWorkflowLogger
{
    Task LogAsync(string workflowName, string eventName, string? entityType, Guid? entityId, object? payload = null, CancellationToken ct = default);
}
