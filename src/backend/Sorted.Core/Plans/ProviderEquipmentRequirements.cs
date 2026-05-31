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
    ];

    public const string Summary =
        "Gardeners must bring their own mower, edging tool or strimmer, watering can or hose, rake, and appropriate brush to every visit.";
}
