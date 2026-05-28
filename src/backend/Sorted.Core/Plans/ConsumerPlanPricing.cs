using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Consumer Essential/Premium pricing. Base prices are for a <see cref="GardenSize.Small"/> garden;
/// each larger size band adds a fixed uplift (monthly or annual equivalent).
/// </summary>
public static class ConsumerPlanPricing
{
    public const decimal MonthlyUpliftPerSizeStepGbp = 10m;
    public const decimal AnnualUpliftPerSizeStepGbp = 100m;

    public static int GardenSizeRank(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => 1,
            GardenSize.Large => 2,
            GardenSize.XLarge => 3,
            GardenSize.XXLarge => 4,
            _ => 0
        };

    public static decimal GardenSizeUplift(GardenSize gardenSize, SubscriptionBillingInterval billingInterval)
    {
        var steps = GardenSizeRank(gardenSize);
        var perStep = billingInterval == SubscriptionBillingInterval.Annual
            ? AnnualUpliftPerSizeStepGbp
            : MonthlyUpliftPerSizeStepGbp;
        return steps * perStep;
    }

    public static decimal ApplyGardenSizeUplift(
        decimal basePriceGbp,
        GardenSize gardenSize,
        SubscriptionBillingInterval billingInterval)
        => basePriceGbp + GardenSizeUplift(gardenSize, billingInterval);
}
