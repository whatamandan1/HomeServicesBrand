using Sorted.Core.Enums;
using Sorted.Core.Plans;
using Xunit;

namespace Sorted.Core.Tests;

public class ConsumerPlanPricingTests
{
    [Theory]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Monthly, 29.95, 29.95)]
    [InlineData(GardenSize.Medium, SubscriptionBillingInterval.Monthly, 29.95, 39.95)]
    [InlineData(GardenSize.Large, SubscriptionBillingInterval.Monthly, 29.95, 49.95)]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Annual, 299.95, 299.95)]
    [InlineData(GardenSize.Medium, SubscriptionBillingInterval.Annual, 299.95, 399.95)]
    [InlineData(GardenSize.Large, SubscriptionBillingInterval.Annual, 299.95, 499.95)]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Monthly, 49.95, 49.95)]
    [InlineData(GardenSize.Medium, SubscriptionBillingInterval.Monthly, 49.95, 59.95)]
    [InlineData(GardenSize.Large, SubscriptionBillingInterval.Monthly, 49.95, 69.95)]
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
