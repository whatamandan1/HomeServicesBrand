using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Garden-size bands: maintained area, visit time, customer monthly price, provider pay per visit.
/// Launch pricing is garden band only; legacy tier names still resolve to the same band price.
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

    /// <summary>Base monthly price by garden band plus visit-frequency tier uplift (add-ons priced separately).</summary>
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
        + SignupAddonPricing.ResolveAddonsCharge(gardenSize, signupAddonIds, billingInterval);

    public static decimal MonthlyTotalGbp(
        string planName,
        GardenSize gardenSize,
        IEnumerable<string>? signupAddonIds = null) =>
        MonthlyPriceGbp(planName, gardenSize) + SignupAddonPricing.MonthlyAddonsTotalGbp(gardenSize, signupAddonIds);

    /// <summary>Map estimated maintained m² to a signup band (above 150 m² still returns Large — ops quote required).</summary>
    public static GardenSize BandFromEstimatedMaintainedSqm(int sqm) =>
        sqm <= MaxMaintainedAreaSqm(GardenSize.Small) ? GardenSize.Small
        : sqm <= MaxMaintainedAreaSqm(GardenSize.Medium) ? GardenSize.Medium
        : GardenSize.Large;
}
