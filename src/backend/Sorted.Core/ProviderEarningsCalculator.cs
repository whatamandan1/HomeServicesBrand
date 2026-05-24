using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core;

public static class ProviderEarningsCalculator
{
    public static decimal CalculateVisitEarningGbp(
        decimal planPriceGbp,
        SubscriptionBillingInterval billingInterval,
        string planName,
        decimal sharePercent)
    {
        var monthlyRevenue = billingInterval == SubscriptionBillingInterval.Annual
            ? planPriceGbp / 12m
            : planPriceGbp;

        var visitsPerMonth = PlanCatalog.VisitsPerMonth(planName);
        var providerMonthlyShare = monthlyRevenue * (sharePercent / 100m);
        return Math.Round(providerMonthlyShare / visitsPerMonth, 2, MidpointRounding.AwayFromZero);
    }
}
