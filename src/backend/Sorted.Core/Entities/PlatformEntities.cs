using Sorted.Core;
using Sorted.Core.Common;
using Sorted.Core.Enums;

namespace Sorted.Core.Entities;

public class Brand : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string PrimaryDomain { get; set; } = string.Empty;
    public string? ThemeJson { get; set; }
    public bool IsActive { get; set; } = true;
}

public class UserAccount : AuditableEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserRole Role { get; set; }
    public Guid? BrandId { get; set; }
    public Brand? Brand { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Customer : AuditableEntity
{
    public Guid UserId { get; set; }
    public UserAccount User { get; set; } = null!;
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public DateTime? TermsAcceptedAtUtc { get; set; }
    public ICollection<CustomerProperty> Properties { get; set; } = [];
    public ICollection<CustomerSubscription> Subscriptions { get; set; } = [];
}

public class CustomerProperty : AuditableEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string Postcode { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Country { get; set; } = "GB";
    public GardenSize GardenSize { get; set; }
    public string? AccessNotes { get; set; }
    public bool IsPrimary { get; set; }
    public ICollection<PropertyMedia> Media { get; set; } = [];
}

public class PropertyMedia : AuditableEntity
{
    public Guid CustomerPropertyId { get; set; }
    public CustomerProperty Property { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "image/jpeg";
    public byte[] Data { get; set; } = [];
    public int SizeBytes { get; set; }
}

public class SubscriptionPlan : AuditableEntity
{
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public SubscriptionBillingInterval BillingInterval { get; set; }
    public int MinimumTermMonths { get; set; }
    public decimal PriceGbp { get; set; }
    public string? StripePriceId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class CustomerSubscription : AuditableEntity
{
    public Guid CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public Guid SubscriptionPlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.PendingPayment;
    public DateTime? StartedAtUtc { get; set; }
    public DateTime? EndsAtUtc { get; set; }
    /// <summary>When the subscription will end after the customer requests cancellation.</summary>
    public DateTime? CancelsAtUtc { get; set; }
    public string? StripeSubscriptionId { get; set; }
    public string? StripeCustomerId { get; set; }
    public string AvailabilityPreference { get; set; } = string.Empty;
    public Guid? PreferredProviderId { get; set; }
    public Provider? PreferredProvider { get; set; }
}

public class PasswordResetToken : AuditableEntity
{
    public Guid UserId { get; set; }
    public UserAccount User { get; set; } = null!;
    public string TokenHash { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? UsedAtUtc { get; set; }
}

public class Provider : AuditableEntity
{
    public Guid UserId { get; set; }
    public UserAccount User { get; set; } = null!;
    public bool IsApproved { get; set; }
    public string? Bio { get; set; }
    public string? CoveragePostcode { get; set; }
    public double? CoverageLatitude { get; set; }
    public double? CoverageLongitude { get; set; }
    public double CoverageRadiusMiles { get; set; } = 10;
    /// <summary>Bitmask: Mon=1 … Sun=64. See <see cref="ProviderWorkingDays"/>.</summary>
    public int WorkingDaysMask { get; set; } = ProviderWorkingDays.DefaultWeekdays;
    public int WorkDayStartMinutes { get; set; } = ProviderWorkHours.DefaultStartMinutes;
    public int WorkDayEndMinutes { get; set; } = ProviderWorkHours.DefaultEndMinutes;
    public ICollection<ProviderTerritory> Territories { get; set; } = [];
    public ICollection<ProviderBlockedDate> BlockedDates { get; set; } = [];
}

public class ProviderBlockedDate : AuditableEntity
{
    public Guid ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;
    public DateOnly BlockedDate { get; set; }
    public string? Reason { get; set; }
}

public class ProviderTerritory : AuditableEntity
{
    public Guid ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;
    public string PostcodeSector { get; set; } = string.Empty;
}

public class JobVisit : AuditableEntity
{
    public Guid CustomerSubscriptionId { get; set; }
    public CustomerSubscription Subscription { get; set; } = null!;
    public Guid CustomerPropertyId { get; set; }
    public CustomerProperty Property { get; set; } = null!;
    public DateTime ScheduledDate { get; set; }
    public string AvailabilityWindow { get; set; } = string.Empty;
    public VisitStatus Status { get; set; } = VisitStatus.Scheduled;
    public Guid? AssignedProviderId { get; set; }
    public Provider? AssignedProvider { get; set; }
    public DateTime? ClaimedAtUtc { get; set; }
    public DateTime? ReminderSentAtUtc { get; set; }
}

public class DispatchOffer : AuditableEntity
{
    public Guid JobVisitId { get; set; }
    public JobVisit JobVisit { get; set; } = null!;
    public DispatchOfferStatus Status { get; set; } = DispatchOfferStatus.Open;
    public DateTime? ExpiresAtUtc { get; set; }
}

public class PaymentRecord : AuditableEntity
{
    public Guid CustomerSubscriptionId { get; set; }
    public CustomerSubscription Subscription { get; set; } = null!;
    public decimal AmountGbp { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public string? StripePaymentIntentId { get; set; }
    public string? StripeCheckoutSessionId { get; set; }
    public string? StripeInvoiceId { get; set; }
}

public class ProviderEarning : AuditableEntity
{
    public Guid ProviderId { get; set; }
    public Provider Provider { get; set; } = null!;
    public Guid JobVisitId { get; set; }
    public JobVisit JobVisit { get; set; } = null!;
    public decimal AmountGbp { get; set; }
    public ProviderEarningStatus Status { get; set; } = ProviderEarningStatus.Accrued;
    public DateTime? PaidAtUtc { get; set; }
    public string? PayoutNotes { get; set; }
}

public class WorkflowEvent : AuditableEntity
{
    public string WorkflowName { get; set; } = string.Empty;
    public string EventName { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string PayloadJson { get; set; } = "{}";
}

public class CommunicationThread : AuditableEntity
{
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string Subject { get; set; } = string.Empty;
    public ICollection<Message> Messages { get; set; } = [];
}

public class Message : AuditableEntity
{
    public Guid ThreadId { get; set; }
    public CommunicationThread Thread { get; set; } = null!;
    public string SenderRole { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsFromAi { get; set; }
}

public class AIActionLog : AuditableEntity
{
    public Guid? CustomerId { get; set; }
    public string ActionType { get; set; } = string.Empty;
    public string PromptSummary { get; set; } = string.Empty;
    public string ResponseSummary { get; set; } = string.Empty;
    public double? ConfidenceScore { get; set; }
    public bool Escalated { get; set; }
}

public class Escalation : AuditableEntity
{
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string Reason { get; set; } = string.Empty;
    public EscalationStatus Status { get; set; } = EscalationStatus.Open;
    public string? Notes { get; set; }
}

public class PortfolioEnquiry : AuditableEntity
{
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public string ContactName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? CompanyName { get; set; }
    public string? Notes { get; set; }
    public PortfolioEnquiryStatus Status { get; set; } = PortfolioEnquiryStatus.New;
    public ICollection<PortfolioEnquiryProperty> Properties { get; set; } = [];
}

public class PortfolioEnquiryProperty : AuditableEntity
{
    public Guid PortfolioEnquiryId { get; set; }
    public PortfolioEnquiry Enquiry { get; set; } = null!;
    public int SortOrder { get; set; }
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string Postcode { get; set; } = string.Empty;
    public GardenSize GardenSize { get; set; }
}

public class MultiPropertyAccount : AuditableEntity
{
    public Guid UserId { get; set; }
    public UserAccount User { get; set; } = null!;
    public Guid BrandId { get; set; }
    public Brand Brand { get; set; } = null!;
    public string? CompanyName { get; set; }
    public decimal? IndicativeMonthlyGbp { get; set; }
    public string? AgreementNotes { get; set; }
    public ICollection<MultiPropertyAccountProperty> Properties { get; set; } = [];
}

public class MultiPropertyAccountProperty : AuditableEntity
{
    public Guid MultiPropertyAccountId { get; set; }
    public MultiPropertyAccount Account { get; set; } = null!;
    public int SortOrder { get; set; }
    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string City { get; set; } = string.Empty;
    public string Postcode { get; set; } = string.Empty;
    public GardenSize GardenSize { get; set; }
    public string VisitFrequency { get; set; } = string.Empty;
    public string ServiceLevel { get; set; } = string.Empty;
    public DateTime? NextVisitDate { get; set; }
}
