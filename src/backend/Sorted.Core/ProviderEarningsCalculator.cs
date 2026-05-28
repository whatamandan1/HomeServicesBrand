using Sorted.Core.Enums;
using Sorted.Core.Options;
using Sorted.Core.Plans;

namespace Sorted.Core;

public static class ProviderEarningsCalculator
{
    public static decimal CalculateVisitEarningGbp(GardenSize gardenSize, ProviderPayoutOptions? options = null)
    {
        if (options is null)
            return ProviderVisitPay.ForGardenSize(gardenSize);

        return gardenSize switch
        {
            GardenSize.Medium => options.MediumVisitGbp,
            GardenSize.Large => options.LargeVisitGbp,
            GardenSize.XLarge => options.XLargeVisitGbp,
            GardenSize.XXLarge => options.XXLargeVisitGbp,
            _ => options.SmallVisitGbp
        };
    }
}
