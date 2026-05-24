using Sorted.Core.Enums;
using Sorted.Core.Options;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

/// <summary>
/// End-to-end money path: garden-size checkout price → provider visit earning.
/// </summary>
public class CheckoutEarningsTests
{
    private static readonly PlanPricingOptions DefaultPlans = new();
    private const decimal SharePercent = 60m;

    private static decimal CheckoutPrice(
        string planName,
        SubscriptionBillingInterval interval,
        GardenSize gardenSize)
    {
        var basePrice = PlanCatalog.IsPremium(planName)
            ? interval == SubscriptionBillingInterval.Monthly
                ? DefaultPlans.PremiumMonthly
                : DefaultPlans.PremiumAnnual
            : interval == SubscriptionBillingInterval.Monthly
                ? DefaultPlans.EssentialMonthly
                : DefaultPlans.EssentialAnnual;

        return ConsumerPlanPricing.ApplyGardenSizeUplift(basePrice, gardenSize, interval);
    }

    private static decimal VisitEarning(
        decimal checkoutPrice,
        SubscriptionBillingInterval interval,
        string planName)
        => ProviderEarningsCalculator.CalculateVisitEarningGbp(
            checkoutPrice,
            interval,
            planName,
            SharePercent);

    [Fact]
    public void Essential_small_garden_checkout_and_earning()
    {
        var checkout = CheckoutPrice("Essential Monthly", SubscriptionBillingInterval.Monthly, GardenSize.Small);
        Assert.Equal(29.95m, checkout);
        Assert.Equal(17.97m, VisitEarning(checkout, SubscriptionBillingInterval.Monthly, "Essential Monthly"));
    }

    [Fact]
    public void Essential_large_garden_checkout_increases_provider_earning()
    {
        var checkout = CheckoutPrice("Essential Monthly", SubscriptionBillingInterval.Monthly, GardenSize.Large);
        Assert.Equal(49.95m, checkout);

        var earning = VisitEarning(checkout, SubscriptionBillingInterval.Monthly, "Essential Monthly");
        Assert.Equal(29.97m, earning);
        Assert.True(earning > VisitEarning(29.95m, SubscriptionBillingInterval.Monthly, "Essential Monthly"));
    }

    [Fact]
    public void Premium_medium_garden_checkout_and_earning()
    {
        var checkout = CheckoutPrice("Premium Monthly", SubscriptionBillingInterval.Monthly, GardenSize.Medium);
        Assert.Equal(59.95m, checkout);

        var earning = VisitEarning(checkout, SubscriptionBillingInterval.Monthly, "Premium Monthly");
        Assert.Equal(17.99m, earning);
    }

    [Fact]
    public void Premium_large_garden_earning_exceeds_small_premium_base()
    {
        var largeCheckout = CheckoutPrice("Premium Monthly", SubscriptionBillingInterval.Monthly, GardenSize.Large);
        Assert.Equal(69.95m, largeCheckout);

        var largeEarning = VisitEarning(largeCheckout, SubscriptionBillingInterval.Monthly, "Premium Monthly");
        var smallEarning = VisitEarning(49.95m, SubscriptionBillingInterval.Monthly, "Premium Monthly");

        Assert.Equal(20.99m, largeEarning);
        Assert.True(largeEarning > smallEarning);
    }
}
