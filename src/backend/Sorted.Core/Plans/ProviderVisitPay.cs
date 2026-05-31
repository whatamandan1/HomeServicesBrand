using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Fixed provider pay per completed visit by garden size — same rate regardless of plan tier.
/// </summary>
public static class ProviderVisitPay
{
    public static decimal ForGardenSize(GardenSize gardenSize) =>
        GardenSizePricing.ProviderPayPerVisitGbp(gardenSize);
}
