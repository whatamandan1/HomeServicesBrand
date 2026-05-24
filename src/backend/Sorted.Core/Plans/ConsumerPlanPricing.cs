using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Consumer Essential/Premium pricing. Base prices are for a <see cref="GardenSize.Small"/> garden;
/// medium and large gardens add a fixed uplift (monthly or annual equivalent).
/// </summary>
public static class ConsumerPlanPricing
{
    public const decimal MediumMonthlyUpliftGbp = 10m;
    public const decimal LargeMonthlyUpliftGbp = 20m;
    public const decimal MediumAnnualUpliftGbp = 100m;
    public const decimal LargeAnnualUpliftGbp = 200m;

    public static decimal GardenSizeUplift(GardenSize gardenSize, SubscriptionBillingInterval billingInterval)
    {
        var isAnnual = billingInterval == SubscriptionBillingInterval.Annual;
        return gardenSize switch
        {
            GardenSize.Medium => isAnnual ? MediumAnnualUpliftGbp : MediumMonthlyUpliftGbp,
            GardenSize.Large => isAnnual ? LargeAnnualUpliftGbp : LargeMonthlyUpliftGbp,
            _ => 0m
        };
    }

    public static decimal ApplyGardenSizeUplift(
        decimal basePriceGbp,
        GardenSize gardenSize,
        SubscriptionBillingInterval billingInterval)
        => basePriceGbp + GardenSizeUplift(gardenSize, billingInterval);
}
