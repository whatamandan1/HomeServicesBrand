using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Services;

public static class PlanPricing
{
    public static decimal ResolvePrice(SubscriptionPlan plan, PlanPricingOptions options)
        => ResolvePrice(plan.BillingInterval, plan.Name, plan.PriceGbp, options);

    public static decimal ResolvePrice(
        SubscriptionBillingInterval billingInterval,
        string planName,
        decimal storedPrice,
        PlanPricingOptions options)
    {
        if (planName.Contains("Monthly", StringComparison.OrdinalIgnoreCase))
            return options.EssentialMonthly;

        if (planName.Contains("Annual", StringComparison.OrdinalIgnoreCase))
            return options.EssentialAnnual;

        return billingInterval switch
        {
            SubscriptionBillingInterval.Monthly => options.EssentialMonthly,
            SubscriptionBillingInterval.Annual => options.EssentialAnnual,
            _ => storedPrice
        };
    }
}
