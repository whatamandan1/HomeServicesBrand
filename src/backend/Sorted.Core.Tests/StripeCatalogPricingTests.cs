using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class StripeCatalogPricingTests
{
    private static SubscriptionPlan MonthlyPlan(string name, string? stripePriceId = "price_test") =>
        new()
        {
            Name = name,
            BillingInterval = SubscriptionBillingInterval.Monthly,
            StripePriceId = stripePriceId,
            PriceGbp = GardenSizePricing.MonthlyPriceGbp(name, GardenSize.Small),
        };

    [Fact]
    public void UseCatalogPriceId_true_for_monthly_small_essential_no_addons()
    {
        var plan = MonthlyPlan("Essential Monthly");
        var price = GardenSizePricing.MonthlyPriceGbp(plan.Name, GardenSize.Small);
        Assert.True(StripeCatalogPricing.UseCatalogPriceId(plan, price, GardenSize.Small, []));
    }

    [Fact]
    public void UseCatalogPriceId_false_when_addons_present()
    {
        var plan = MonthlyPlan("Essential Monthly");
        var price = GardenSizePricing.MonthlyPriceGbp(plan.Name, GardenSize.Small) + 10m;
        Assert.False(StripeCatalogPricing.UseCatalogPriceId(plan, price, GardenSize.Small, ["hedges"]));
    }

    [Fact]
    public void UseCatalogPriceId_false_for_medium_garden()
    {
        var plan = MonthlyPlan("Premium Monthly");
        var price = GardenSizePricing.MonthlyPriceGbp(plan.Name, GardenSize.Medium);
        Assert.False(StripeCatalogPricing.UseCatalogPriceId(plan, price, GardenSize.Medium, []));
    }

    [Fact]
    public void UseCatalogPriceId_false_for_annual()
    {
        var plan = MonthlyPlan("Elite Annual");
        plan.BillingInterval = SubscriptionBillingInterval.Annual;
        var price = GardenSizePricing.AnnualPriceGbp(plan.Name, GardenSize.Small);
        Assert.False(StripeCatalogPricing.UseCatalogPriceId(plan, price, GardenSize.Small, []));
    }

    [Theory]
    [InlineData(40, GardenSize.Small)]
    [InlineData(50, GardenSize.Small)]
    [InlineData(75, GardenSize.Medium)]
    [InlineData(120, GardenSize.Large)]
    public void BandFromEstimatedMaintainedSqm_maps_bands(int sqm, GardenSize expected) =>
        Assert.Equal(expected, GardenSizePricing.BandFromEstimatedMaintainedSqm(sqm));
}
