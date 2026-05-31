using System.Text.Json;
using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Optional signup add-ons — priced per on-site session, amortised into monthly subscription.
/// Hedges / seasonal: 4× per year. Patio &amp; path refresh: 2× per year.
/// </summary>
public static class SignupAddonPricing
{
    public const decimal ProviderRatePerHourGbp = 20m;
    public const decimal PlatformRatePerHourGbp = 5m;
    public const decimal CustomerRatePerHourGbp = 25m;

    public const int StandardAddonOccurrencesPerYear = 4;
    public const int PatioAddonOccurrencesPerYear = 2;

    public static readonly IReadOnlySet<string> AddonServiceIds =
        new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "hedges", "seasonal", "patio" };

    public static int OccurrencesPerYear(string addonId) =>
        addonId.Equals("patio", StringComparison.OrdinalIgnoreCase)
            ? PatioAddonOccurrencesPerYear
            : StandardAddonOccurrencesPerYear;

    /// <summary>Extra on-site minutes per add-on session.</summary>
    public static int AddonOnSiteMinutesPerSession(GardenSize gardenSize) =>
        gardenSize switch
        {
            GardenSize.Large => 120,
            GardenSize.Medium => 90,
            _ => 60
        };

    public static decimal AddonOnSiteHours(GardenSize gardenSize) =>
        AddonOnSiteMinutesPerSession(gardenSize) / 60m;

    public static decimal CustomerPricePerOccurrence(GardenSize gardenSize) =>
        CustomerRatePerHourGbp * AddonOnSiteHours(gardenSize);

    public static decimal ProviderPayPerOccurrence(GardenSize gardenSize) =>
        ProviderRatePerHourGbp * AddonOnSiteHours(gardenSize);

    public static decimal PlatformMarginPerOccurrence(GardenSize gardenSize) =>
        PlatformRatePerHourGbp * AddonOnSiteHours(gardenSize);

    /// <summary>Full-schedule monthly charge (no tier inclusion) — used for display reference.</summary>
    public static decimal MonthlyCustomerPriceForAddon(GardenSize gardenSize, string addonId)
    {
        var annual = CustomerPricePerOccurrence(gardenSize) * OccurrencesPerYear(addonId);
        return Math.Round(annual / 12m, 2, MidpointRounding.AwayFromZero);
    }

    public static int CountAddons(IEnumerable<string>? addonIds) =>
        addonIds?.Count(id => AddonServiceIds.Contains(id)) ?? 0;

    public static decimal MonthlyAddonsTotalGbp(
        GardenSize gardenSize,
        string planName,
        IEnumerable<string>? addonIds)
    {
        return TierIncludedAddons.OrderedSelectedAddons(addonIds)
            .Sum(id => TierIncludedAddons.MonthlyCustomerPriceForAddon(gardenSize, planName, id, addonIds));
    }

    public static decimal ResolveAddonsCharge(
        GardenSize gardenSize,
        string planName,
        IEnumerable<string>? addonIds,
        SubscriptionBillingInterval billingInterval)
    {
        var monthly = MonthlyAddonsTotalGbp(gardenSize, planName, addonIds);
        return billingInterval == SubscriptionBillingInterval.Annual
            ? monthly * GardenSizePricing.AnnualMonthsCharged
            : monthly;
    }

    public static string[] ParseSignupAddonIds(string? json)
    {
        if (string.IsNullOrWhiteSpace(json))
            return [];

        try
        {
            return JsonSerializer.Deserialize<string[]>(json) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}
