namespace Sorted.Core.Plans;

public static class PlanCatalog
{
    public const string EliteToken = "Elite";
    public const string PremiumToken = "Premium";
    public const string EssentialToken = "Essential";

    public const int EssentialVisitsPerYear = 10;
    public const int PremiumVisitsPerYear = 20;
    public const int EliteVisitsPerYear = 30;

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

    /// <summary>Single plan offered at signup for launch (Premium/Elite reserved for future tiers).</summary>
    public const string SignupMonthlyPlanName = "Essential Monthly";

    public static bool IsOfferedAtSignup(string planName) =>
        planName.Equals(SignupMonthlyPlanName, StringComparison.OrdinalIgnoreCase);

    /// <summary>Next tier for in-account upgrades — disabled until multi-tier plans return.</summary>
    public static string? GetUpgradeTier(string planName) => null;

    /// <summary>Included garden visits per year on an active subscription.</summary>
    public static int VisitsPerYear(string planName) =>
        IsElite(planName) ? EliteVisitsPerYear
        : IsPremium(planName) ? PremiumVisitsPerYear
        : EssentialVisitsPerYear;

    /// <summary>Rounded average visits per calendar month (for display / legacy helpers).</summary>
    public static int VisitsPerMonth(string planName) =>
        (int)Math.Ceiling(VisitsPerYear(planName) / 12.0);

    /// <summary>Days between scheduled visits (365-day year ÷ visits per year).</summary>
    public static int VisitIntervalDays(string planName) =>
        (int)Math.Round(365.0 / VisitsPerYear(planName));
}
