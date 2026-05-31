using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class SubscriptionCommitmentTests
{
    [Fact]
    public void Monthly_without_addons_uses_plan_minimum() =>
        Assert.Equal(
            3,
            SubscriptionCommitment.ResolveMinimumTermMonths(
                SubscriptionBillingInterval.Monthly,
                3,
                null));

    [Fact]
    public void Monthly_with_addons_is_six_months() =>
        Assert.Equal(
            6,
            SubscriptionCommitment.ResolveMinimumTermMonths(
                SubscriptionBillingInterval.Monthly,
                3,
                ["hedges"]));

    [Fact]
    public void Annual_with_addons_stays_twelve_months() =>
        Assert.Equal(
            12,
            SubscriptionCommitment.ResolveMinimumTermMonths(
                SubscriptionBillingInterval.Annual,
                12,
                ["hedges", "patio"]));
}
