namespace Sorted.Core.Plans;

/// <summary>Checks required before a gardener is approved on the platform.</summary>
public static class ProviderVettingRequirements
{
    public static readonly IReadOnlyList<string> RequiredChecks =
    [
        "Upload a clear photo of valid photo ID (e.g. passport or driving licence)",
        "Right to work in the UK as a self-employed contractor (verified from submitted documents)",
        "Basic DBS check passed",
        "Own relevant insurance (e.g. public liability for gardening work)",
    ];

    public const string Summary =
        "Gardeners must provide ID, pass right-to-work verification, pass a basic DBS check, and hold their own relevant insurance before approval.";

    /// <summary>Admin checklist - confirm before setting <c>Provider.IsApproved</c>.</summary>
    public static readonly IReadOnlyList<string> AdminApprovalChecklist =
    [
        "Photo ID upload reviewed and matched to submitted details",
        "Right to work verified from photo ID and submitted document details (self-employed contractor)",
        "Basic DBS check passed (certificate or update service result on file)",
        "Relevant insurance confirmed (policy or certificate on file)",
        "Equipment requirement understood",
    ];
}
