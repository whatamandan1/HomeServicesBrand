using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
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
    Task SendEmailAsync(string toEmail, string subject, string plainText, CancellationToken ct = default);
    Task SendOpsEmailAsync(string subject, string plainText, CancellationToken ct = default);
}

public interface ISmsService
{
    Task SendSmsAsync(string toPhone, string body, CancellationToken ct = default);
}

public interface ICommunicationService
{
    Task NotifyWelcomeAsync(string email, string? phone, string firstName, CancellationToken ct = default);
    Task NotifySubscriptionConfirmedAsync(
        string email, string? phone, string firstName, string planName, string availability, CancellationToken ct = default);
    Task NotifyPasswordResetAsync(string email, string resetUrl, CancellationToken ct = default);
    Task NotifyVisitScheduledAsync(
        string email, string firstName, IReadOnlyList<DateTime> visitDates, CancellationToken ct = default);
    Task NotifyVisitClaimedAsync(
        string email, string? phone, string firstName, DateTime visitDate, string postcode, string? window, CancellationToken ct = default);
    Task NotifyVisitReminderAsync(
        string email, string? phone, string firstName, DateTime visitDate, string postcode, string? window, CancellationToken ct = default);
    Task NotifyVisitCompletedAsync(
        string email, string? phone, string firstName, string postcode, DateTime? nextVisitDate, CancellationToken ct = default);
    Task NotifyVisitCancelledAsync(
        string email, string? phone, string firstName, DateTime visitDate, string postcode, DateTime? newDate, CancellationToken ct = default);
    Task NotifyVisitRescheduledAsync(
        string email, string? phone, string firstName, DateTime oldDate, DateTime newDate, string postcode, string? window,
        bool weatherRelated = false, CancellationToken ct = default);
    Task NotifyVisitNoProviderAsync(string email, string firstName, DateTime visitDate, CancellationToken ct = default);
    Task NotifyPaymentFailedAsync(string email, string? phone, string firstName, CancellationToken ct = default);
    Task NotifyPaymentRetryAsync(string email, string firstName, CancellationToken ct = default);
    Task NotifyRenewalAsync(
        string email, string firstName, decimal amount, string planName, DateTime periodEnd, CancellationToken ct = default);
    Task NotifyCancellationConfirmedAsync(
        string email, string? phone, string firstName, DateTime cancelsAt, CancellationToken ct = default);
    Task NotifyUpgradeConfirmedAsync(string email, string firstName, string newPlanName, CancellationToken ct = default);
    Task NotifyAnnualSwitchConfirmedAsync(
        string email, string firstName, string planName, DateTime renewalDate, CancellationToken ct = default);
    Task NotifyPortfolioEnquiryAckAsync(string email, string contactName, CancellationToken ct = default);
    Task NotifyPortfolioEnquiryOpsAsync(
        string contactName, string email, string phone, int propertyCount, CancellationToken ct = default);
    Task NotifyEscalationAckAsync(string email, string firstName, string summary, CancellationToken ct = default);
    Task NotifyEscalationResolvedAsync(string email, string firstName, string resolution, CancellationToken ct = default);
    Task NotifyProviderApplyAckAsync(string email, string firstName, CancellationToken ct = default);
    Task NotifyProviderApprovedAsync(string email, string firstName, CancellationToken ct = default);
    Task NotifyProviderDispatchAsync(
        string email, string? phone, DateTime visitDate, string outcode, string? window, CancellationToken ct = default);
    Task NotifyProviderVisitReminderAsync(
        string phone, DateTime visitDate, string outcode, string? window, CancellationToken ct = default);
    Task NotifyProviderVisitCancelledAsync(string phone, DateTime visitDate, string outcode, CancellationToken ct = default);
    Task NotifyProviderPayoutAsync(
        string email, string firstName, decimal amount, DateTime periodEnd, string? notes, CancellationToken ct = default);
    Task NotifyOpsPaymentFailedAsync(string customerEmail, Guid subscriptionId, CancellationToken ct = default);
    Task NotifyOpsVisitUnclaimedAsync(DateTime visitDate, string postcode, Guid visitId, CancellationToken ct = default);
    Task NotifyOpsProviderApplyAsync(string name, string email, string phone, CancellationToken ct = default);
    Task NotifyOpsEscalationAsync(string reason, Guid escalationId, CancellationToken ct = default);
    Task NotifyAbandonEmail1Async(Sorted.Core.Entities.SignupLead lead, CancellationToken ct = default);
    Task NotifyAbandonEmail2Async(Sorted.Core.Entities.SignupLead lead, CancellationToken ct = default);
    Task NotifyAbandonEmail3Async(Sorted.Core.Entities.SignupLead lead, CancellationToken ct = default);
    Task NotifyAbandonSmsAsync(Sorted.Core.Entities.SignupLead lead, CancellationToken ct = default);
    Task NotifyCheckoutAbandonAsync(
        string email, string firstName, string planName, CancellationToken ct = default);
    Task NotifyAnnualNudgeAsync(string email, string firstName, CancellationToken ct = default);
    Task NotifyReviewAskAsync(string email, string? phone, string firstName, CancellationToken ct = default);
    Task NotifyWinbackAsync(string email, string firstName, CancellationToken ct = default);
}

public interface IScheduledCommunicationService
{
    Task RunScheduledNotificationsAsync(CancellationToken ct = default);
}

public interface IAiSupportService
{
    Task<SupportChatResponse> ChatAsync(Guid customerId, SupportChatRequest request, CancellationToken ct = default);
    Task<SupportChatResponse> GuestChatAsync(SupportChatRequest request, CancellationToken ct = default);
}

public record OpenDispatchResult(int Opened, int AutoAssigned);

public interface IVisitSchedulingService
{
    Task GenerateVisitsForSubscriptionAsync(Guid subscriptionId, int count = 4, CancellationToken ct = default);
    Task<OpenDispatchResult> OpenVisitsForDispatchAsync(CancellationToken ct = default);
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

public interface IGardenSizeSuggestionService
{
    Task<GardenSizeSuggestionResponse?> SuggestAsync(GardenSizeSuggestRequest request, CancellationToken ct = default);
}

public interface IProviderCoverageService
{
    Task SyncTerritoriesAsync(Provider provider, CancellationToken ct = default);
    void ScheduleTerritorySync(Guid providerId);
    void ScheduleTerritoryResync(Guid providerId);
    Task<bool> IsPropertyWithinCoverageAsync(Provider provider, CustomerProperty property, CancellationToken ct = default);
    Task<double?> GetDistanceMilesAsync(Provider provider, CustomerProperty property, CancellationToken ct = default);
}

public interface IDataPrivacyService
{
    Task<object> ExportUserDataAsync(Guid userId, CancellationToken ct = default);
    Task DeleteAccountAsync(Guid userId, string confirmation, CancellationToken ct = default);
}

public interface IProviderAvailabilityService
{
    Task<bool> IsAvailableAsync(
        Provider provider,
        DateTime scheduledDate,
        string? customerAvailabilityWindow = null,
        CancellationToken ct = default);
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
    Task<int> ReleaseConflictingAssignedVisitsAsync(Provider provider, CancellationToken ct = default);
}

public interface IProviderEarningsService
{
    Task AccrueForCompletedVisitAsync(Guid jobVisitId, Guid providerId, CancellationToken ct = default);
    Task<ProviderEarningsSummaryResponse> GetProviderEarningsAsync(Guid providerId, CancellationToken ct = default);
    Task<ProviderEarningResponse> MarkPaidAsync(Guid earningId, string? notes, CancellationToken ct = default);
}

public interface IPortfolioEnquiryService
{
    Task<PortfolioEnquirySubmittedResponse> SubmitAsync(SubmitPortfolioEnquiryRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<PortfolioEnquirySummaryResponse>> ListForAdminAsync(CancellationToken ct = default);
    Task<PortfolioEnquiryDetailResponse?> GetForAdminAsync(Guid enquiryId, CancellationToken ct = default);
    Task<PortfolioEnquiryDetailResponse> UpdateStatusAsync(Guid enquiryId, PortfolioEnquiryStatus status, CancellationToken ct = default);
}

public interface ISignupLeadService
{
    Task<CaptureSignupLeadResponse> CaptureAsync(CaptureSignupLeadRequest request, CancellationToken ct = default);
    Task MarkConvertedAsync(string email, string brandCode = "gardens-sorted", CancellationToken ct = default);
    Task<IReadOnlyList<SignupLeadSummaryResponse>> ListActiveForAdminAsync(CancellationToken ct = default);
}

public interface IWorkflowLogger
{
    Task LogAsync(string workflowName, string eventName, string? entityType, Guid? entityId, object? payload = null, CancellationToken ct = default);
}
