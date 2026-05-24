using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Fixed provider pay per completed visit by garden size — same rate regardless of plan tier.
/// </summary>
public static class ProviderVisitPay
{
    public const decimal SmallVisitGbp = 15.00m;
    public const decimal MediumVisitUpliftGbp = 3.00m;
    public const decimal LargeVisitUpliftGbp = 6.00m;

    public static decimal ForGardenSize(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => SmallVisitGbp + MediumVisitUpliftGbp,
            GardenSize.Large => SmallVisitGbp + LargeVisitUpliftGbp,
            _ => SmallVisitGbp
        };
}
