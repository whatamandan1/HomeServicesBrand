using Sorted.Core.Enums;
using Sorted.Core.Plans;
using Xunit;

namespace Sorted.Core.Tests;

public class ConsumerPlanPricingTests
{
    [Theory]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Monthly, 59.99)]
    [InlineData(GardenSize.Medium, SubscriptionBillingInterval.Monthly, 79.99)]
    [InlineData(GardenSize.Large, SubscriptionBillingInterval.Monthly, 99.99)]
    [InlineData(GardenSize.Small, SubscriptionBillingInterval.Annual, 599.90)]
    public void Essential_prices(GardenSize size, SubscriptionBillingInterval interval, decimal expected)
    {
        var actual = ConsumerPlanPricing.ApplyGardenSizeUplift(0m, size, interval);
        Assert.Equal(expected, actual);
    }
}
