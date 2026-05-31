using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class TierIncludedAddonsTests
{
    [Fact]
    public void Elite_merges_all_three_addons_for_storage()
    {
        var merged = TierIncludedAddons.MergeAddonsForStorage("Elite Monthly", []);
        Assert.Equal(3, merged.Count);
        Assert.Contains("hedges", merged);
        Assert.Contains("seasonal", merged);
        Assert.Contains("patio", merged);
    }

    [Fact]
    public void Elite_charges_nothing_for_addons()
    {
        var monthly = SignupAddonPricing.MonthlyAddonsTotalGbp(
            GardenSize.Small,
            "Elite Monthly",
            ["hedges", "seasonal", "patio"]);
        Assert.Equal(0m, monthly);
    }

    [Fact]
    public void Premium_first_addon_billable_sessions_are_total_minus_one()
    {
        Assert.Equal(3, TierIncludedAddons.BillableOccurrencesPerYear(
            "Premium Monthly", "hedges", ["hedges"]));
        Assert.Equal(6.25m, TierIncludedAddons.MonthlyCustomerPriceForAddon(
            GardenSize.Small, "Premium Monthly", "hedges", ["hedges"]));
    }

    [Fact]
    public void Premium_second_addon_uses_full_schedule()
    {
        Assert.Equal(4, TierIncludedAddons.BillableOccurrencesPerYear(
            "Premium Monthly", "seasonal", ["hedges", "seasonal"]));
        Assert.Equal(8.33m, TierIncludedAddons.MonthlyCustomerPriceForAddon(
            GardenSize.Small, "Premium Monthly", "seasonal", ["hedges", "seasonal"]));
    }

    [Fact]
    public void Essential_pays_full_addon_schedule()
    {
        Assert.Equal(8.33m, SignupAddonPricing.MonthlyAddonsTotalGbp(
            GardenSize.Small,
            "Essential Monthly",
            ["hedges"]));
    }
}
