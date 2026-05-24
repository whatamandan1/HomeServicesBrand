namespace Sorted.Core.Plans;

public static class PlanCatalog
{
    public const string EliteToken = "Elite";
    public const string PremiumToken = "Premium";
    public const string EssentialToken = "Essential";

    public static bool IsElite(string planName) =>
        planName.Contains(EliteToken, StringComparison.OrdinalIgnoreCase);

    public static bool IsPremium(string planName) =>
        planName.Contains(PremiumToken, StringComparison.OrdinalIgnoreCase);

    public static bool IsEssential(string planName) =>
        planName.Contains(EssentialToken, StringComparison.OrdinalIgnoreCase);

    public static string GetTier(string planName)
    {
        if (IsElite(planName))
            return EliteToken;
        if (IsPremium(planName))
            return PremiumToken;
        if (IsEssential(planName))
            return EssentialToken;
        return planName;
    }

    /// <summary>Next tier for in-account upgrades, or null when already on Elite.</summary>
    public static string? GetUpgradeTier(string planName)
    {
        if (IsEssential(planName))
            return PremiumToken;
        if (IsPremium(planName))
            return EliteToken;
        return null;
    }

    /// <summary>Included garden visits per calendar month of an active subscription.</summary>
    public static int VisitsPerMonth(string planName) =>
        IsElite(planName) ? 3 : IsPremium(planName) ? 2 : 1;

    /// <summary>Days between scheduled visits for a plan (30-day month basis).</summary>
    public static int VisitIntervalDays(string planName) =>
        30 / VisitsPerMonth(planName);
}
