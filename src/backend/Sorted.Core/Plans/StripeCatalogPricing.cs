using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Options;

namespace Sorted.Core.Plans;

/// <summary>
/// When to use pre-defined Stripe Price IDs vs dynamic checkout amounts.
/// </summary>
public static class StripeCatalogPricing
{
    /// <summary>
    /// Use a Stripe catalog Price ID only for the three monthly tier plans at small-garden base price (no add-ons).
    /// Annual, medium/large gardens, and add-ons always use dynamic <c>price_data</c>.
    /// </summary>
    public static bool UseCatalogPriceId(
        SubscriptionPlan plan,
        decimal chargePrice,
        GardenSize gardenSize,
        IReadOnlyList<string> addonIds)
    {
        if (plan.BillingInterval != SubscriptionBillingInterval.Monthly)
            return false;
        if (gardenSize != GardenSize.Small)
            return false;
        if (addonIds.Count > 0)
            return false;
        if (string.IsNullOrWhiteSpace(plan.StripePriceId))
            return false;
        if (!PlanCatalog.IsEssential(plan.Name) && !PlanCatalog.IsPremium(plan.Name) && !PlanCatalog.IsElite(plan.Name))
            return false;

        var catalog = GardenSizePricing.MonthlyPriceGbp(plan.Name, GardenSize.Small);
        return chargePrice == catalog;
    }
}
