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
        PriceGbp = 29.95m,
    };

    private static SubscriptionPlan PremiumMonthlyPlan() => new()
    {
        Name = "Premium Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 54.95m,
    };

    private static SubscriptionPlan EliteMonthlyPlan() => new()
    {
        Name = "Elite Monthly",
        BillingInterval = SubscriptionBillingInterval.Monthly,
        PriceGbp = 89.95m,
    };

    [Theory]
    [InlineData(GardenSize.Small, 29.95)]
    [InlineData(GardenSize.Medium, 39.95)]
    [InlineData(GardenSize.Large, 49.95)]
    public void ResolvePrice_essential_monthly_includes_garden_size_uplift(GardenSize size, decimal expected)
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, size);
        Assert.Equal(expected, price);
    }

    [Theory]
    [InlineData(GardenSize.Small, 54.95)]
    [InlineData(GardenSize.Medium, 64.95)]
    [InlineData(GardenSize.Large, 74.95)]
    public void ResolvePrice_premium_monthly_includes_garden_size_uplift(GardenSize size, decimal expected)
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
            PriceGbp = 299.95m,
        };

        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, GardenSize.Large);
        Assert.Equal(499.95m, price);
    }

    [Theory]
    [InlineData(GardenSize.Small, 89.95)]
    [InlineData(GardenSize.Medium, 99.95)]
    [InlineData(GardenSize.Large, 109.95)]
    public void ResolvePrice_elite_monthly_includes_garden_size_uplift(GardenSize size, decimal expected)
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
            PriceGbp = 899.95m,
        };

        var price = PlanPricing.ResolvePrice(plan, DefaultOptions, GardenSize.Large);
        Assert.Equal(1099.95m, price);
    }

    [Fact]
    public void ResolvePrice_defaults_to_small_garden_when_not_specified()
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions);
        Assert.Equal(29.95m, price);
    }
}
