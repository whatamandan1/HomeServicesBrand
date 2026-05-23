namespace Sorted.Core.Plans;

public static class PlanCatalog
{
    public const string PremiumToken = "Premium";
    public const string EssentialToken = "Essential";

    public static bool IsPremium(string planName) =>
        planName.Contains(PremiumToken, StringComparison.OrdinalIgnoreCase);

    public static bool IsEssential(string planName) =>
        planName.Contains(EssentialToken, StringComparison.OrdinalIgnoreCase);

    public static string GetTier(string planName)
    {
        if (IsPremium(planName))
            return PremiumToken;
        if (IsEssential(planName))
            return EssentialToken;
        return planName;
    }
}
