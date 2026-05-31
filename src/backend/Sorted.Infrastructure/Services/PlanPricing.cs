using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Options;
using Sorted.Core.Plans;

namespace Sorted.Infrastructure.Services;

public static class PlanPricing
{
    public static decimal ResolvePrice(SubscriptionPlan plan, PlanPricingOptions options)
        => ResolvePrice(plan.BillingInterval, plan.Name, plan.PriceGbp, options, GardenSize.Small);

    public static decimal ResolvePrice(
        SubscriptionPlan plan,
        PlanPricingOptions options,
        GardenSize gardenSize,
        IEnumerable<string>? signupAddonIds = null)
        => ResolvePrice(plan.BillingInterval, plan.Name, plan.PriceGbp, options, gardenSize, signupAddonIds);

    public static decimal ResolvePrice(
        SubscriptionBillingInterval billingInterval,
        string planName,
        decimal storedPrice,
        PlanPricingOptions options,
        GardenSize gardenSize = GardenSize.Small,
        IEnumerable<string>? signupAddonIds = null)
    {
        _ = ResolveBasePrice(billingInterval, planName, storedPrice, options);
        return GardenSizePricing.ResolvePrice(planName, gardenSize, billingInterval, signupAddonIds);
    }

    private static decimal ResolveBasePrice(
        SubscriptionBillingInterval billingInterval,
        string planName,
        decimal storedPrice,
        PlanPricingOptions options)
    {
        if (PlanCatalog.IsElite(planName))
        {
            return billingInterval == SubscriptionBillingInterval.Monthly
                ? options.EliteMonthly
                : options.EliteAnnual;
        }

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
