namespace Sorted.Core.Plans;

public static class ProviderVettingRules
{
    public static readonly IReadOnlyList<string> IdDocumentTypes =
    [
        "Passport",
        "DrivingLicence",
        "BiometricResidencePermit",
        "NationalIdentityCard",
        "Other",
    ];

    public static bool IsShareCodeValid(string? shareCode)
    {
        if (string.IsNullOrWhiteSpace(shareCode)) return false;
        var code = shareCode.Trim();
        return code.Length == 9 && code.All(char.IsLetterOrDigit);
    }

    public static bool HasMinimumSubmission(
        DateOnly? dateOfBirth,
        string? idDocumentType,
        string? idDocumentNumber,
        string? rightToWorkShareCode,
        string? rightToWorkDocumentDescription,
        string? dbsCertificateNumber,
        DateOnly? dbsIssueDate,
        bool hasOwnRelevantInsurance)
    {
        if (!hasOwnRelevantInsurance) return false;
        if (dateOfBirth is null) return false;
        if (string.IsNullOrWhiteSpace(idDocumentType) || string.IsNullOrWhiteSpace(idDocumentNumber))
            return false;

        var hasRtw = !string.IsNullOrWhiteSpace(rightToWorkDocumentDescription)
                     || IsShareCodeValid(rightToWorkShareCode);
        if (!hasRtw) return false;

        if (string.IsNullOrWhiteSpace(dbsCertificateNumber) || dbsIssueDate is null)
            return false;

        return true;
    }
}
