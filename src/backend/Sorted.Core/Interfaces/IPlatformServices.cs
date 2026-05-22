using Sorted.Core.Dtos;
using Sorted.Core.Entities;

namespace Sorted.Core.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default);
    Task<AuthResponse> RegisterProviderAsync(RegisterProviderRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<UserProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default);
}

public interface IStripePaymentService
{
    Task<CheckoutSessionResponse> CreateSignupCheckoutAsync(CustomerSubscription subscription, SubscriptionPlan plan, string customerEmail, CancellationToken ct = default);
    Task HandleWebhookAsync(string json, string stripeSignature, CancellationToken ct = default);
}

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string toEmail, string firstName, CancellationToken ct = default);
    Task SendSubscriptionConfirmedEmailAsync(string toEmail, string planName, CancellationToken ct = default);
}

public interface ISmsService
{
    Task SendWelcomeSmsAsync(string toPhone, string firstName, CancellationToken ct = default);
    Task SendSubscriptionConfirmedSmsAsync(string toPhone, string planName, CancellationToken ct = default);
    Task SendVisitClaimedSmsAsync(string toPhone, DateTime visitDate, string postcode, CancellationToken ct = default);
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
}

public interface IVisitManagementService
{
    Task<JobVisitResponse> CancelVisitAsync(Guid visitId, Guid? owningCustomerId, bool allowInProgress, CancellationToken ct = default);
    Task<JobVisitResponse> RescheduleVisitAsync(Guid visitId, DateTime scheduledDate, Guid? owningCustomerId, bool allowInProgress, CancellationToken ct = default);
}

public interface IWorkflowLogger
{
    Task LogAsync(string workflowName, string eventName, string? entityType, Guid? entityId, object? payload = null, CancellationToken ct = default);
}
