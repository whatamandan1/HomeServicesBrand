using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class PlanCatalogTests
{
    [Theory]
    [InlineData("Essential Monthly", true, false)]
    [InlineData("Premium Annual", false, true)]
    [InlineData("Garden Care Plus", false, false)]
    public void Plan_tier_detection(string planName, bool essential, bool premium)
    {
        Assert.Equal(essential, PlanCatalog.IsEssential(planName));
        Assert.Equal(premium, PlanCatalog.IsPremium(planName));
    }

    [Fact]
    public void GetTier_returns_known_tier_names()
    {
        Assert.Equal("Premium", PlanCatalog.GetTier("Premium Monthly"));
        Assert.Equal("Essential", PlanCatalog.GetTier("Essential Annual"));
    }

    [Theory]
    [InlineData("Essential Monthly", 1, 30)]
    [InlineData("Essential Annual", 1, 30)]
    [InlineData("Premium Monthly", 2, 15)]
    [InlineData("Premium Annual", 2, 15)]
    public void Visit_cadence_matches_plan(string planName, int visitsPerMonth, int intervalDays)
    {
        Assert.Equal(visitsPerMonth, PlanCatalog.VisitsPerMonth(planName));
        Assert.Equal(intervalDays, PlanCatalog.VisitIntervalDays(planName));
    }
}
