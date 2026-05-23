namespace Sorted.Core.Plans;

public static class PlanCatalog
{
    public static bool IsPremium(string planName) =>
        planName.Contains("Premium", StringComparison.OrdinalIgnoreCase);

    public static bool IsEssential(string planName) =>
        planName.Contains("Essential", StringComparison.OrdinalIgnoreCase);

    public static string GetTier(string planName)
    {
        if (IsPremium(planName))
            return "Premium";
        if (IsEssential(planName))
            return "Essential";
        return planName;
    }
}
