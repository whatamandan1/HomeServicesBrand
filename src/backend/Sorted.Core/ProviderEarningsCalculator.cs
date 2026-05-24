using Sorted.Core.Enums;

namespace Sorted.Core;

public static class ProviderEarningsCalculator
{
    public static decimal CalculateVisitEarningGbp(
        decimal planPriceGbp,
        SubscriptionBillingInterval billingInterval,
        int visitIntervalDays,
        decimal sharePercent)
    {
        if (visitIntervalDays <= 0)
            throw new ArgumentOutOfRangeException(nameof(visitIntervalDays));

        var monthlyRevenue = billingInterval == SubscriptionBillingInterval.Annual
            ? planPriceGbp / 12m
            : planPriceGbp;

        var visitsPerMonth = 30m / visitIntervalDays;
        var providerMonthlyShare = monthlyRevenue * (sharePercent / 100m);
        return Math.Round(providerMonthlyShare / visitsPerMonth, 2, MidpointRounding.AwayFromZero);
    }
}
