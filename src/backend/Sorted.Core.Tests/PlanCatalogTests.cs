using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class PlanCatalogTests
{
    [Theory]
    [InlineData("Essential Monthly", true, false, false)]
    [InlineData("Premium Annual", false, true, false)]
    [InlineData("Elite Monthly", false, false, true)]
    [InlineData("Garden Care Plus", false, false, false)]
    public void Plan_tier_detection(string planName, bool essential, bool premium, bool elite)
    {
        Assert.Equal(essential, PlanCatalog.IsEssential(planName));
        Assert.Equal(premium, PlanCatalog.IsPremium(planName));
        Assert.Equal(elite, PlanCatalog.IsElite(planName));
    }

    [Fact]
    public void GetTier_returns_known_tier_names()
    {
        Assert.Equal("Premium", PlanCatalog.GetTier("Premium Monthly"));
        Assert.Equal("Essential", PlanCatalog.GetTier("Essential Annual"));
        Assert.Equal("Elite", PlanCatalog.GetTier("Elite Monthly"));
    }

    [Theory]
    [InlineData("Essential Monthly", "Premium")]
    [InlineData("Premium Monthly", "Elite")]
    [InlineData("Elite Monthly", null)]
    public void GetUpgradeTier_returns_next_tier(string planName, string? expected)
    {
        Assert.Equal(expected, PlanCatalog.GetUpgradeTier(planName));
    }

    [Theory]
    [InlineData("Essential Monthly", 1, 30)]
    [InlineData("Essential Annual", 1, 30)]
    [InlineData("Premium Monthly", 2, 15)]
    [InlineData("Premium Annual", 2, 15)]
    [InlineData("Elite Monthly", 3, 10)]
    [InlineData("Elite Annual", 3, 10)]
    public void Visit_cadence_matches_plan(string planName, int visitsPerMonth, int intervalDays)
    {
        Assert.Equal(visitsPerMonth, PlanCatalog.VisitsPerMonth(planName));
        Assert.Equal(intervalDays, PlanCatalog.VisitIntervalDays(planName));
    }
}
