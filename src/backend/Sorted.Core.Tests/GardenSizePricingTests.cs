using Sorted.Core.Enums;
using Sorted.Core.Plans;
using Xunit;

namespace Sorted.Core.Tests;

public class GardenSizePricingTests
{
    [Theory]
    [InlineData(GardenSize.Small, 50, 60, 59.99, 20)]
    [InlineData(GardenSize.Medium, 100, 90, 79.99, 30)]
    [InlineData(GardenSize.Large, 150, 120, 99.99, 40)]
    public void Band_table(
        GardenSize size,
        int maxSqm,
        int minutes,
        decimal monthly,
        decimal providerVisit)
    {
        Assert.Equal(maxSqm, GardenSizePricing.MaxMaintainedAreaSqm(size));
        Assert.Equal(minutes, GardenSizePricing.TargetOnSiteMinutes(size));
        Assert.Equal(monthly, GardenSizePricing.EssentialMonthlyPriceGbp(size));
        Assert.Equal(providerVisit, GardenSizePricing.ProviderPayPerVisitGbp(size));
    }

    [Theory]
    [InlineData("Essential Monthly", GardenSize.Small, 59.99)]
    [InlineData("Essential Monthly", GardenSize.Medium, 79.99)]
    [InlineData("Essential Monthly", GardenSize.Large, 99.99)]
    [InlineData("Premium Monthly", GardenSize.Small, 84.99)]
    [InlineData("Premium Monthly", GardenSize.Medium, 104.99)]
    [InlineData("Elite Monthly", GardenSize.Large, 159.99)]
    public void Monthly_price_by_plan_and_garden(string plan, GardenSize size, decimal expected) =>
        Assert.Equal(expected, GardenSizePricing.MonthlyPriceGbp(plan, size));

    [Fact]
    public void Essential_annual_small_is_ten_times_monthly() =>
        Assert.Equal(599.90m, GardenSizePricing.AnnualPriceGbp("Essential Annual", GardenSize.Small));
}
