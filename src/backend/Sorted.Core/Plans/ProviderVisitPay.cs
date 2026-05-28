using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Fixed provider pay per completed visit by garden size — same rate regardless of plan tier.
/// </summary>
public static class ProviderVisitPay
{
    public const decimal SmallVisitGbp = 15.00m;
    public const decimal VisitPayPerSizeStepGbp = 3.00m;

    public static int GardenSizeRank(GardenSize gardenSize) =>
        ConsumerPlanPricing.GardenSizeRank(gardenSize);

    public static decimal ForGardenSize(GardenSize gardenSize) =>
        SmallVisitGbp + GardenSizeRank(gardenSize) * VisitPayPerSizeStepGbp;
}
