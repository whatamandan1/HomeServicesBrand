using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Plans;

namespace Sorted.Infrastructure.Services;

public static class ProviderVettingMapper
{
    public static ProviderVettingStatusResponse ToStatus(Provider p) =>
        new(
            p.VettingSubmittedAtUtc is not null,
            IsSubmissionComplete(p),
            p.IdVerifiedAtUtc is not null,
            p.RightToWorkVerifiedAtUtc is not null,
            p.DbsVerifiedAtUtc is not null,
            p.InsuranceVerifiedAtUtc is not null,
            p.VettingSubmittedAtUtc);

    public static ProviderVettingDetailsResponse ToDetails(Provider p, bool maskIdNumber) =>
        new(
            ToStatus(p),
            p.DateOfBirth,
            p.IdDocumentType,
            maskIdNumber ? MaskIdNumber(p.IdDocumentNumber) : p.IdDocumentNumber,
            p.RightToWorkShareCode,
            p.RightToWorkDocumentDescription,
            p.DbsCertificateNumber,
            p.DbsIssueDate,
            p.DbsOnUpdateService,
            p.HasLeafBlower,
            p.HasHedgeTrimmer,
            p.HasPressureWasherForPatio,
            p.HasOwnRelevantInsurance);

    public static AdminProviderVettingResponse ToAdminDetails(Provider p) =>
        new(
            p.Id,
            ToStatus(p),
            p.DateOfBirth,
            p.IdDocumentType,
            p.IdDocumentNumber,
            p.RightToWorkShareCode,
            p.RightToWorkDocumentDescription,
            p.DbsCertificateNumber,
            p.DbsIssueDate,
            p.DbsOnUpdateService,
            p.HasLeafBlower,
            p.HasHedgeTrimmer,
            p.HasPressureWasherForPatio,
            p.HasOwnRelevantInsurance);

    private static string? MaskIdNumber(string? number)
    {
        if (string.IsNullOrWhiteSpace(number)) return null;
        var trimmed = number.Trim();
        if (trimmed.Length <= 4) return "****";
        return new string('*', trimmed.Length - 4) + trimmed[^4..];
    }

    public static bool IsSubmissionComplete(Provider p) =>
        ProviderVettingRules.HasMinimumSubmission(
            p.DateOfBirth,
            p.IdDocumentType,
            p.IdDocumentNumber,
            p.RightToWorkShareCode,
            p.RightToWorkDocumentDescription,
            p.DbsCertificateNumber,
            p.DbsIssueDate,
            p.HasOwnRelevantInsurance);

    public static void ApplySubmission(Provider p, SubmitProviderVettingRequest request)
    {
        p.DateOfBirth = request.DateOfBirth;
        p.IdDocumentType = request.IdDocumentType?.Trim();
        p.IdDocumentNumber = request.IdDocumentNumber?.Trim();
        p.RightToWorkShareCode = string.IsNullOrWhiteSpace(request.RightToWorkShareCode)
            ? null
            : request.RightToWorkShareCode.Trim();
        p.RightToWorkDocumentDescription = string.IsNullOrWhiteSpace(request.RightToWorkDocumentDescription)
            ? null
            : request.RightToWorkDocumentDescription.Trim();
        p.DbsCertificateNumber = request.DbsCertificateNumber?.Trim();
        p.DbsIssueDate = request.DbsIssueDate;
        p.DbsOnUpdateService = request.DbsOnUpdateService;
        p.HasLeafBlower = request.HasLeafBlower;
        p.HasHedgeTrimmer = request.HasHedgeTrimmer;
        p.HasPressureWasherForPatio = request.HasPressureWasherForPatio;
        p.HasOwnRelevantInsurance = request.HasOwnRelevantInsurance;
        p.VettingSubmittedAtUtc = DateTime.UtcNow;
        p.UpdatedAtUtc = DateTime.UtcNow;
    }

    public static string? ValidateSubmission(SubmitProviderVettingRequest request)
    {
        if (request.DateOfBirth is null)
            return "Date of birth is required.";

        if (string.IsNullOrWhiteSpace(request.IdDocumentType) || string.IsNullOrWhiteSpace(request.IdDocumentNumber))
            return "ID document type and number are required.";

        if (!ProviderVettingRules.IdDocumentTypes.Contains(request.IdDocumentType.Trim(), StringComparer.OrdinalIgnoreCase))
            return "Select a valid ID document type.";

        var hasShareCode = ProviderVettingRules.IsShareCodeValid(request.RightToWorkShareCode);
        var hasDocDesc = !string.IsNullOrWhiteSpace(request.RightToWorkDocumentDescription);
        if (!hasShareCode && !hasDocDesc)
            return "Provide a UK right-to-work share code (9 characters) or describe the document you will show us.";

        if (hasShareCode && hasDocDesc)
            return "Provide either a right-to-work share code or a document description, not both.";

        if (string.IsNullOrWhiteSpace(request.DbsCertificateNumber) || request.DbsIssueDate is null)
            return "DBS certificate number and issue date are required.";

        if (!request.HasOwnRelevantInsurance)
            return "You must confirm you hold your own relevant insurance (e.g. public liability for gardening work).";

        return null;
    }
}
