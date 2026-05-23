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
}
