namespace Sorted.Core.Enums;

public enum UserRole
{
    Customer = 1,
    Provider = 2,
    Admin = 3,
    Landlord = 4
}

public enum SubscriptionBillingInterval
{
    Monthly = 1,
    Annual = 2
}

public enum SubscriptionStatus
{
    PendingPayment = 1,
    Active = 2,
    PastDue = 3,
    Cancelled = 4,
    Expired = 5
}

public enum VisitStatus
{
    Scheduled = 1,
    OpenForClaim = 2,
    Claimed = 3,
    InProgress = 4,
    Completed = 5,
    Cancelled = 6,
    Rescheduled = 7
}

public enum DispatchOfferStatus
{
    Open = 1,
    Claimed = 2,
    Expired = 3,
    Cancelled = 4
}

public enum PaymentStatus
{
    Pending = 1,
    Succeeded = 2,
    Failed = 3,
    Refunded = 4
}

public enum EscalationStatus
{
    Open = 1,
    InProgress = 2,
    Resolved = 3
}

public enum GardenSize
{
    Small = 1,
    Medium = 2,
    Large = 3
}

public enum ProviderEarningStatus
{
    Accrued = 1,
    Paid = 2,
    Cancelled = 3
}

public enum PortfolioEnquiryStatus
{
    New = 1,
    Quoted = 2,
    UnderReview = 3,
    Accepted = 4,
    Active = 5,
    Closed = 6
}

public enum SignupLeadStatus
{
    Active = 1,
    Converted = 2
}
