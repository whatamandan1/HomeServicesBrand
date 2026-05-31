using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Garden-size bands: maintained area, visit time, customer monthly price, provider pay per visit.
/// Plan tier adds a fixed monthly amount on top of the garden price (see <see cref="TierMonthlyAddonGbp"/>).
/// </summary>
public static class GardenSizePricing
{
    public const decimal PremiumMonthlyAddonGbp = 25m;
    public const decimal EliteMonthlyAddonGbp = 60m;

    /// <summary>Annual checkout ≈ 10× monthly (~two months free vs paying monthly).</summary>
    public const int AnnualMonthsCharged = 10;

    public static int MaxMaintainedAreaSqm(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => 100,
            GardenSize.Large => 150,
            _ => 50
        };

    public static int TargetOnSiteMinutes(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => 90,
            GardenSize.Large => 120,
            _ => 60
        };

    public static decimal EssentialMonthlyPriceGbp(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => 79.99m,
            GardenSize.Large => 99.99m,
            _ => 59.99m
        };

    public static decimal ProviderPayPerVisitGbp(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Medium => 30m,
            GardenSize.Large => 40m,
            _ => 20m
        };

    public static decimal MonthlyPriceGbp(string planName, GardenSize gardenSize)
    {
        var price = EssentialMonthlyPriceGbp(gardenSize);
        if (PlanCatalog.IsElite(planName))
            return price + EliteMonthlyAddonGbp;
        if (PlanCatalog.IsPremium(planName))
            return price + PremiumMonthlyAddonGbp;
        return price;
    }

    public static decimal AnnualPriceGbp(string planName, GardenSize gardenSize) =>
        MonthlyPriceGbp(planName, gardenSize) * AnnualMonthsCharged;

    public static decimal ResolvePrice(
        string planName,
        GardenSize gardenSize,
        SubscriptionBillingInterval billingInterval,
        IEnumerable<string>? signupAddonIds = null) =>
        (billingInterval == SubscriptionBillingInterval.Annual
            ? AnnualPriceGbp(planName, gardenSize)
            : MonthlyPriceGbp(planName, gardenSize))
        + SignupAddonPricing.ResolveAddonsCharge(gardenSize, planName, signupAddonIds, billingInterval);

    public static decimal MonthlyTotalGbp(
        string planName,
        GardenSize gardenSize,
        IEnumerable<string>? signupAddonIds = null) =>
        MonthlyPriceGbp(planName, gardenSize)
        + SignupAddonPricing.MonthlyAddonsTotalGbp(gardenSize, planName, signupAddonIds);
}
