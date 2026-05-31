using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Add-on sessions included in Premium / Elite before extra signup add-on charges apply.
/// Premium: one chosen add-on, 1× per year. Elite: hedges, seasonal, and patio, 1× each per year.
/// </summary>
public static class TierIncludedAddons
{
    public const int IncludedSessionsPerAddonPerYear = 1;

    public static IReadOnlyList<string> MergeAddonsForStorage(string planName, IEnumerable<string>? selectedAddonIds)
    {
        var ordered = OrderedSelectedAddons(selectedAddonIds);
        if (PlanCatalog.IsElite(planName))
        {
            var merged = new List<string>(ordered);
            foreach (var id in SignupAddonPricing.AddonServiceIds)
            {
                if (!merged.Contains(id, StringComparer.OrdinalIgnoreCase))
                    merged.Add(id);
            }
            return merged;
        }
        return ordered;
    }

    public static IReadOnlyList<string> OrderedSelectedAddons(IEnumerable<string>? addonIds) =>
        addonIds?
            .Where(id => SignupAddonPricing.AddonServiceIds.Contains(id))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList() ?? [];

    public static int IncludedOccurrencesForAddon(
        string planName,
        string addonId,
        IEnumerable<string>? selectedAddonIds)
    {
        if (!SignupAddonPricing.AddonServiceIds.Contains(addonId))
            return 0;

        if (PlanCatalog.IsElite(planName))
            return IncludedSessionsPerAddonPerYear;

        if (PlanCatalog.IsPremium(planName))
        {
            var ordered = OrderedSelectedAddons(selectedAddonIds);
            if (ordered.Count == 0)
                return 0;
            return ordered[0].Equals(addonId, StringComparison.OrdinalIgnoreCase)
                ? IncludedSessionsPerAddonPerYear
                : 0;
        }

        return 0;
    }

    public static int BillableOccurrencesPerYear(
        string planName,
        string addonId,
        IEnumerable<string>? selectedAddonIds)
    {
        if (!SignupAddonPricing.AddonServiceIds.Contains(addonId))
            return 0;

        var ordered = OrderedSelectedAddons(selectedAddonIds);
        var total = SignupAddonPricing.OccurrencesPerYear(addonId);

        if (PlanCatalog.IsElite(planName))
            return 0;

        if (!ordered.Contains(addonId, StringComparer.OrdinalIgnoreCase))
            return 0;

        if (PlanCatalog.IsPremium(planName)
            && ordered[0].Equals(addonId, StringComparison.OrdinalIgnoreCase))
            return Math.Max(0, total - IncludedSessionsPerAddonPerYear);

        return total;
    }

    public static decimal MonthlyCustomerPriceForAddon(
        GardenSize gardenSize,
        string planName,
        string addonId,
        IEnumerable<string>? selectedAddonIds)
    {
        var billable = BillableOccurrencesPerYear(planName, addonId, selectedAddonIds);
        if (billable <= 0)
            return 0m;

        var annual = SignupAddonPricing.CustomerPricePerOccurrence(gardenSize) * billable;
        return Math.Round(annual / 12m, 2, MidpointRounding.AwayFromZero);
    }
}
