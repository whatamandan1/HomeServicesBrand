namespace Sorted.Core.Plans;

/// <summary>
/// Optional add-on equipment gardeners declare in vetting — required to be assigned matching customer add-ons.
/// </summary>
public static class ProviderAddonEquipmentRequirements
{
    public const string LeafBlowerKey = "leafBlower";
    public const string HedgeTrimmerKey = "hedgeTrimmer";
    public const string PressureWasherPatioKey = "pressureWasherPatio";

    public static readonly IReadOnlyList<ProviderAddonEquipmentItem> Items =
    [
        new(
            LeafBlowerKey,
            "Leaf blower",
            "Seasonal tidy and leaf clearance",
            "You must own and maintain a working leaf blower suitable for domestic gardens."),
        new(
            HedgeTrimmerKey,
            "Hedge trimmer",
            "Hedge trimming add-on visits",
            "Electric, battery, or petrol hedge trimmer you are competent to use safely."),
        new(
            PressureWasherPatioKey,
            "Pressure washer (patio-safe)",
            "Patio and path refresh",
            "Pressure washer with an appropriate patio/path attachment or low-pressure setting to avoid damaging slabs, pointing, or decking."),
    ];
}

public record ProviderAddonEquipmentItem(
    string Key,
    string Label,
    string EnablesServices,
    string Detail);
