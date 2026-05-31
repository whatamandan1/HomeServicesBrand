namespace Sorted.Core.Plans;

/// <summary>Checks required before a gardener is approved on the platform.</summary>
public static class ProviderVettingRequirements
{
    public static readonly IReadOnlyList<string> RequiredChecks =
    [
        "Valid photo ID (e.g. passport or driving licence)",
        "Right to work in the UK (verified by GardensSorted before approval)",
        "Basic DBS check passed",
    ];

    public const string Summary =
        "Gardeners must provide ID, pass right-to-work verification, and pass a basic DBS check before approval.";

    /// <summary>Admin checklist — confirm before setting <c>Provider.IsApproved</c>.</summary>
    public static readonly IReadOnlyList<string> AdminApprovalChecklist =
    [
        "Photo ID sighted and recorded",
        "Right to work in the UK verified",
        "Basic DBS check passed (certificate or update service result on file)",
        "Equipment requirement understood",
    ];
}
