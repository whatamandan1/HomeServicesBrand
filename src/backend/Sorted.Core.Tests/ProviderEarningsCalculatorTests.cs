using Sorted.Core;
using Sorted.Core.Enums;

namespace Sorted.Core.Tests;

public class ProviderEarningsCalculatorTests
{
    [Fact]
    public void CalculateVisitEarningGbp_uses_share_of_monthly_revenue_per_visit()
    {
        // £29.95/mo, 60% share, ~4.29 visits/month at 7-day interval → ~£4.19/visit
        var amount = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            29.95m,
            SubscriptionBillingInterval.Monthly,
            visitIntervalDays: 7,
            sharePercent: 60m);

        Assert.Equal(4.19m, amount);
    }

    [Fact]
    public void CalculateVisitEarningGbp_prorates_annual_plans()
    {
        var monthly = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            299.95m,
            SubscriptionBillingInterval.Annual,
            visitIntervalDays: 7,
            sharePercent: 60m);

        var expectedMonthlyPlan = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            299.95m / 12m,
            SubscriptionBillingInterval.Monthly,
            visitIntervalDays: 7,
            sharePercent: 60m);

        Assert.Equal(expectedMonthlyPlan, monthly);
    }
}
