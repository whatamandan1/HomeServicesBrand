using Sorted.Core.Entities;
using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Minimum commitment periods - extended when optional signup add-ons are selected on monthly billing.
/// </summary>
public static class SubscriptionCommitment
{
    public const int MonthlyMinimumTermWithAddonsMonths = 6;

    public static bool HasSignupAddons(IEnumerable<string>? signupAddonIds) =>
        SignupAddonPricing.CountAddons(signupAddonIds) > 0;

    public static int ResolveMinimumTermMonths(
        SubscriptionBillingInterval billingInterval,
        int planMinimumTermMonths,
        IEnumerable<string>? signupAddonIds)
    {
        if (billingInterval == SubscriptionBillingInterval.Annual)
            return planMinimumTermMonths;

        return HasSignupAddons(signupAddonIds)
            ? MonthlyMinimumTermWithAddonsMonths
            : planMinimumTermMonths;
    }

    public static int ResolveMinimumTermMonths(SubscriptionPlan plan, IEnumerable<string>? signupAddonIds) =>
        ResolveMinimumTermMonths(plan.BillingInterval, plan.MinimumTermMonths, signupAddonIds);

    public static int ResolveMinimumTermMonths(CustomerSubscription subscription) =>
        ResolveMinimumTermMonths(
            subscription.Plan.BillingInterval,
            subscription.Plan.MinimumTermMonths,
            SignupAddonPricing.ParseSignupAddonIds(subscription.SelectedSignupAddonsJson));

    public static DateTime MinimumTermEndsAtUtc(CustomerSubscription subscription, DateTime? fromUtc = null)
    {
        var start = fromUtc ?? subscription.StartedAtUtc ?? DateTime.UtcNow;
        return start.AddMonths(ResolveMinimumTermMonths(subscription));
    }
}
