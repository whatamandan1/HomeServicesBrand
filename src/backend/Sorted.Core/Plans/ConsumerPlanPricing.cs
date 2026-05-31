using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Resolves consumer checkout price by garden size and plan. See <see cref="GardenSizePricing"/>.
/// </summary>
public static class ConsumerPlanPricing
{
    public static decimal ApplyGardenSizeUplift(
        decimal basePriceGbp,
        GardenSize gardenSize,
        SubscriptionBillingInterval billingInterval)
    {
        _ = basePriceGbp;
        return GardenSizePricing.EssentialMonthlyPriceGbp(gardenSize)
            * (billingInterval == SubscriptionBillingInterval.Annual
                ? GardenSizePricing.AnnualMonthsCharged
                : 1);
    }

    /// <summary>Legacy rank helper — prefer <see cref="GardenSizePricing"/>.</summary>
    public static int GardenSizeRank(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => 1,
            GardenSize.Large => 2,
            _ => 0
        };
}
