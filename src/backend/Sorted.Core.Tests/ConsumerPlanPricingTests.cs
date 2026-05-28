using Sorted.Core.Enums;
using Sorted.Core.Plans;
using Xunit;

namespace Sorted.Core.Tests;

public class ConsumerPlanPricingTests
{
    [Theory]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Monthly, 39.95, 39.95)]
    [InlineData(GardenSize.Medium, SubscriptionBillingInterval.Monthly, 39.95, 49.95)]
    [InlineData(GardenSize.Large, SubscriptionBillingInterval.Monthly, 39.95, 59.95)]
    [InlineData(GardenSize.XLarge, SubscriptionBillingInterval.Monthly, 39.95, 69.95)]
    [InlineData(GardenSize.XXLarge, SubscriptionBillingInterval.Monthly, 39.95, 79.95)]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Annual, 399.95, 399.95)]
    [InlineData(GardenSize.Medium, SubscriptionBillingInterval.Annual, 399.95, 499.95)]
    [InlineData(GardenSize.Large, SubscriptionBillingInterval.Annual, 399.95, 599.95)]
    [InlineData(GardenSize.XLarge, SubscriptionBillingInterval.Annual, 399.95, 699.95)]
    [InlineData(GardenSize.XXLarge, SubscriptionBillingInterval.Annual, 399.95, 799.95)]
    public void ApplyGardenSizeUplift(
        GardenSize size,
        SubscriptionBillingInterval interval,
        decimal basePrice,
        decimal expected)
    {
        var actual = ConsumerPlanPricing.ApplyGardenSizeUplift(basePrice, size, interval);
        Assert.Equal(expected, actual);
    }
}
