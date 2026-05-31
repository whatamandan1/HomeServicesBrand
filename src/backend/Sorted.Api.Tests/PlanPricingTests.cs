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
        PriceGbp = 59.99m,
    };

    private static SubscriptionPlan PremiumMonthlyPlan() => new()
    {
        Name = "Premium Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 84.99m,
    };

    private static SubscriptionPlan EliteMonthlyPlan() => new()
    {
        Name = "Elite Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 119.95m,
    };

    [Theory]
    [InlineData(GardenSize.Small, 59.99)]
    [InlineData(GardenSize.Medium, 79.99)]
    [InlineData(GardenSize.Large, 99.99)]
    public void ResolvePrice_essential_monthly(GardenSize size, decimal expected)
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Theory]
    [InlineData(GardenSize.Small, 84.99)]
    [InlineData(GardenSize.Medium, 104.99)]
    [InlineData(GardenSize.Large, 124.99)]
    public void ResolvePrice_premium_monthly(GardenSize size, decimal expected)
    {
        var plan = PremiumMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Fact]
    public void ResolvePrice_essential_annual_large_garden()
    {
        var plan = new SubscriptionPlan
        {
            Name = "Essential Annual",
            BillingInterval = SubscriptionBillingInterval.Annual,
            PriceGbp = 599.95m,
        };

        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, GardenSize.Large);
        Assert.Equal(999.90m, price);
    }

    [Theory]
    [InlineData(GardenSize.Small, 119.99)]
    [InlineData(GardenSize.Medium, 139.99)]
    [InlineData(GardenSize.Large, 159.99)]
    public void ResolvePrice_elite_monthly(GardenSize size, decimal expected)
    {
        var plan = EliteMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Fact]
    public void ResolvePrice_elite_annual_large_garden()
    {
        var plan = new SubscriptionPlan
        {
            Name = "Elite Annual",
            BillingInterval = SubscriptionBillingInterval.Annual,
            PriceGbp = 1199.95m,
        };

        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, GardenSize.Large);
        Assert.Equal(1599.90m, price);
    }

    [Fact]
    public void ResolvePrice_defaults_to_small_garden_when_not_specified()
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions);
        Assert.Equal(59.99m, price);
    }
}
