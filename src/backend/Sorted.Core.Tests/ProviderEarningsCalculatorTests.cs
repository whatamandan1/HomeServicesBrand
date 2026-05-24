using Sorted.Core;
using Sorted.Core.Enums;

namespace Sorted.Core.Tests;

public class ProviderEarningsCalculatorTests
{
    [Fact]
    public void CalculateVisitEarningGbp_essential_one_visit_per_month()
    {
        // £29.95/mo, 60% share, 1 visit/month → £17.97/visit
        var amount = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            29.95m,
            SubscriptionBillingInterval.Monthly,
            "Essential Monthly",
            sharePercent: 60m);

        Assert.Equal(17.97m, amount);
    }

    [Fact]
    public void CalculateVisitEarningGbp_premium_two_visits_per_month()
    {
        // £49.95/mo, 60% share, 2 visits/month → £14.99/visit
        var amount = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            49.95m,
            SubscriptionBillingInterval.Monthly,
            "Premium Monthly",
            sharePercent: 60m);

        Assert.Equal(14.99m, amount);
    }

    [Fact]
    public void CalculateVisitEarningGbp_prorates_annual_plans()
    {
        var monthly = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            299.95m,
            SubscriptionBillingInterval.Annual,
            "Essential Annual",
            sharePercent: 60m);

        var expectedMonthlyPlan = ProviderEarningsCalculator.CalculateVisitEarningGbp(
            299.95m / 12m,
            SubscriptionBillingInterval.Monthly,
            "Essential Annual",
            sharePercent: 60m);

        Assert.Equal(expectedMonthlyPlan, monthly);
    }
}
