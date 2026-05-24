using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class ProviderEarningsCalculatorTests
{
    [Theory]
    [InlineData("Essential Monthly")]
    [InlineData("Premium Monthly")]
    [InlineData("Elite Monthly")]
    public void Same_per_visit_pay_regardless_of_plan_tier(string planName)
    {
        _ = planName;
        var amount = ProviderEarningsCalculator.CalculateVisitEarningGbp(GardenSize.Small);
        Assert.Equal(15.00m, amount);
    }

    [Theory]
    [InlineData(GardenSize.Small, 15.00)]
    [InlineData(GardenSize.Medium, 18.00)]
    [InlineData(GardenSize.Large, 21.00)]
    public void Visit_pay_scales_with_garden_size_not_tier(GardenSize gardenSize, decimal expected)
    {
        Assert.Equal(expected, ProviderEarningsCalculator.CalculateVisitEarningGbp(gardenSize));
    }
}
