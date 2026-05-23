using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Options;
using Sorted.Core.Plans;

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
        if (PlanCatalog.IsPremium(planName))
        {
            return billingInterval == SubscriptionBillingInterval.Monthly
                ? options.PremiumMonthly
                : options.PremiumAnnual;
        }

        if (PlanCatalog.IsEssential(planName))
        {
            return billingInterval == SubscriptionBillingInterval.Monthly
                ? options.EssentialMonthly
                : options.EssentialAnnual;
        }

        return billingInterval switch
        {
            SubscriptionBillingInterval.Monthly => options.EssentialMonthly,
            SubscriptionBillingInterval.Annual => options.EssentialAnnual,
            _ => storedPrice
        };
    }
}
