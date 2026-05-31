using Sorted.Core.Enums;
using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class SignupAddonPricingTests
{
    [Theory]
    [InlineData(GardenSize.Small, 60, 20, 25)]
    [InlineData(GardenSize.Medium, 90, 30, 37.5)]
    [InlineData(GardenSize.Large, 120, 40, 50)]
    public void Per_session_rates_by_garden_size(
        GardenSize size,
        int minutes,
        decimal provider,
        decimal customer)
    {
        Assert.Equal(minutes, SignupAddonPricing.AddonOnSiteMinutesPerSession(size));
        Assert.Equal(provider, SignupAddonPricing.ProviderPayPerOccurrence(size));
        Assert.Equal(customer, SignupAddonPricing.CustomerPricePerOccurrence(size));
    }

    [Theory]
    [InlineData("hedges", 4)]
    [InlineData("seasonal", 4)]
    [InlineData("patio", 2)]
    public void Occurrences_per_year_by_addon(string addonId, int expected) =>
        Assert.Equal(expected, SignupAddonPricing.OccurrencesPerYear(addonId));

    [Fact]
    public void Hedge_at_small_is_8_33_per_month()
    {
        Assert.Equal(8.33m, SignupAddonPricing.MonthlyCustomerPriceForAddon(GardenSize.Small, "hedges"));
    }

    [Fact]
    public void Patio_at_large_is_8_33_per_month()
    {
        Assert.Equal(8.33m, SignupAddonPricing.MonthlyCustomerPriceForAddon(GardenSize.Large, "patio"));
    }

    [Fact]
    public void Hedge_and_patio_at_large_monthly_total()
    {
        var monthly = SignupAddonPricing.MonthlyAddonsTotalGbp(
            GardenSize.Large,
            ["hedges", "patio"]);
        Assert.Equal(16.67m + 8.33m, monthly);
    }

    [Fact]
    public void Resolve_price_includes_amortised_addon_on_essential_small()
    {
        var monthly = GardenSizePricing.ResolvePrice(
            "Essential Monthly",
            GardenSize.Small,
            SubscriptionBillingInterval.Monthly,
            signupAddonIds: ["hedges"]);
        Assert.Equal(59.99m + 8.33m, monthly);
    }
}
