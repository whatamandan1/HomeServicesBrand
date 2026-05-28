using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Options;
using Sorted.Infrastructure.Services;

namespace Sorted.Api.Tests;

public class PlanPricingTests
{
    private static readonly PlanPricingOptions DefaultOptions = new();

    private static SubscriptionPlan EssentialMonthlyPlan() => new()
    {
        Name = "Essential Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 39.95m,
    };

    private static SubscriptionPlan PremiumMonthlyPlan() => new()
    {
        Name = "Premium Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 64.95m,
    };

    private static SubscriptionPlan EliteMonthlyPlan() => new()
    {
        Name = "Elite Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 99.95m,
    };

    [Theory]
    [InlineData(GardenSize.Small, 39.95)]
    [InlineData(GardenSize.Medium, 49.95)]
    [InlineData(GardenSize.Large, 59.95)]
    [InlineData(GardenSize.XLarge, 69.95)]
    [InlineData(GardenSize.XXLarge, 79.95)]
    public void ResolvePrice_essential_monthly_includes_garden_size_uplift(GardenSize size, decimal expected)
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Theory]
    [InlineData(GardenSize.Small, 64.95)]
    [InlineData(GardenSize.Medium, 74.95)]
    [InlineData(GardenSize.Large, 84.95)]
    [InlineData(GardenSize.XLarge, 94.95)]
    [InlineData(GardenSize.XXLarge, 104.95)]
    public void ResolvePrice_premium_monthly_includes_garden_size_uplift(GardenSize size, decimal expected)
    {
        var plan = PremiumMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Fact]
    public void ResolvePrice_essential_annual_xxlarge_garden()
    {
        var plan = new SubscriptionPlan
        {
            Name = "Essential Annual",
            BillingInterval = SubscriptionBillingInterval.Annual,
            PriceGbp = 399.95m,
        };

        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, GardenSize.XXLarge);
        Assert.Equal(799.95m, price);
    }

    [Theory]
    [InlineData(GardenSize.Small, 99.95)]
    [InlineData(GardenSize.Medium, 109.95)]
    [InlineData(GardenSize.Large, 119.95)]
    [InlineData(GardenSize.XLarge, 129.95)]
    [InlineData(GardenSize.XXLarge, 139.95)]
    public void ResolvePrice_elite_monthly_includes_garden_size_uplift(GardenSize size, decimal expected)
    {
        var plan = EliteMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Fact]
    public void ResolvePrice_elite_annual_xxlarge_garden()
    {
        var plan = new SubscriptionPlan
        {
            Name = "Elite Annual",
            BillingInterval = SubscriptionBillingInterval.Annual,
            PriceGbp = 909.95m,
        };

        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, GardenSize.XXLarge);
        Assert.Equal(1309.95m, price);
    }

    [Fact]
    public void ResolvePrice_defaults_to_small_garden_when_not_specified()
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions);
        Assert.Equal(39.95m, price);
    }
}
