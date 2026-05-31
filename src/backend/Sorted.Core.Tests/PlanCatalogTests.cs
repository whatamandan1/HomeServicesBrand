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

    [Fact]
    public void GetUpgradeTier_disabled_for_launch() =>
        Assert.Null(PlanCatalog.GetUpgradeTier("Essential Monthly"));

    [Theory]
    [InlineData("Essential Monthly", true)]
    [InlineData("Premium Monthly", false)]
    [InlineData("Essential Annual", false)]
    public void IsOfferedAtSignup_only_essential_monthly(string planName, bool offered) =>
        Assert.Equal(offered, PlanCatalog.IsOfferedAtSignup(planName));

    [Theory]
    [InlineData("Essential Monthly", 10, 36)]
    [InlineData("Essential Annual", 10, 36)]
    [InlineData("Premium Monthly", 20, 18)]
    [InlineData("Premium Annual", 20, 18)]
    [InlineData("Elite Monthly", 30, 12)]
    [InlineData("Elite Annual", 30, 12)]
    public void Visit_cadence_matches_plan(string planName, int visitsPerYear, int intervalDays)
    {
        Assert.Equal(visitsPerYear, PlanCatalog.VisitsPerYear(planName));
        Assert.Equal(intervalDays, PlanCatalog.VisitIntervalDays(planName));
    }

    [Theory]
    [InlineData("Essential Monthly", 1)]
    [InlineData("Premium Monthly", 2)]
    [InlineData("Elite Monthly", 3)]
    public void Visits_per_month_is_ceiling_of_annual_cadence(string planName, int visitsPerMonth)
    {
        Assert.Equal(visitsPerMonth, PlanCatalog.VisitsPerMonth(planName));
    }
}
