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
        PriceGbp = 49.95m,
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
    [InlineData(GardenSize.Small, 49.95)]
    [InlineData(GardenSize.Medium, 59.95)]
    [InlineData(GardenSize.Large, 69.95)]
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

    [Fact]
    public void ResolvePrice_defaults_to_small_garden_when_not_specified()
    {
        var plan = EssentialMonthlyPlan();
        var price = PlanPricing.ResolvePrice(plan, DefaultOptions);
        Assert.Equal(29.95m, price);
    }
}
