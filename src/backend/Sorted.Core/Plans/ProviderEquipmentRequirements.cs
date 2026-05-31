namespace Sorted.Core.Plans;

/// <summary>Minimum equipment gardeners must bring to each visit (platform does not supply tools).</summary>
public static class ProviderEquipmentRequirements
{
    public static readonly IReadOnlyList<string> RequiredItems =
    [
        "Lawn mower (suitable for typical domestic gardens)",
        "Edging tool or strimmer for lawn edges",
        "Watering can or hose for light watering",
        "Rake",
        "Appropriate brush or broom for tidying paths and edges",
        "Extension lead — at least 20 metres",
    ];

    public const string Summary =
        "Gardeners must bring mower, strimmer or edger, hose or watering can, rake, brush, and a 20 m+ extension lead to every visit.";
}
