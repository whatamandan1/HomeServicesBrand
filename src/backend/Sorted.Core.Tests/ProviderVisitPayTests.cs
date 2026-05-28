using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class ProviderVisitPayTests
{
    [Theory]
    [InlineData("Essential Monthly", GardenSize.Small, 15.00)]
    [InlineData("Premium Monthly", GardenSize.Small, 15.00)]
    [InlineData("Elite Monthly", GardenSize.Small, 15.00)]
    [InlineData("Elite Monthly", GardenSize.Large, 21.00)]
    [InlineData("Elite Monthly", GardenSize.XLarge, 24.00)]
    [InlineData("Elite Monthly", GardenSize.XXLarge, 27.00)]
    public void Flat_per_visit_rate_by_garden_size(string planName, GardenSize gardenSize, decimal expected)
    {
        _ = planName;
        Assert.Equal(expected, ProviderVisitPay.ForGardenSize(gardenSize));
    }

    [Fact]
    public void Elite_monthly_provider_total_scales_with_visit_count()
    {
        var perVisit = ProviderVisitPay.ForGardenSize(GardenSize.Small);
        var eliteMonthly = perVisit * PlanCatalog.VisitsPerMonth("Elite Monthly");
        Assert.Equal(45m, eliteMonthly);
    }
}
