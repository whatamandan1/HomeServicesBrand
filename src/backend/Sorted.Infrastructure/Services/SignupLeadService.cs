using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class SignupLeadService(SortedDbContext db, IWorkflowLogger workflow) : ISignupLeadService
{
    public async Task<CaptureSignupLeadResponse> CaptureAsync(
        CaptureSignupLeadRequest request,
        CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
            throw new InvalidOperationException("Enter a valid email address.");

        if (string.IsNullOrWhiteSpace(request.Phone))
            throw new InvalidOperationException("Enter a phone number.");

        if (string.IsNullOrWhiteSpace(request.FirstName))
            throw new InvalidOperationException("Enter your first name.");

        var brandCode = string.IsNullOrWhiteSpace(request.BrandCode) ? "gardens-sorted" : request.BrandCode.Trim();
        var brand = await db.Brands.FirstOrDefaultAsync(b => b.Code == brandCode && b.IsActive, ct)
            ?? throw new InvalidOperationException("Brand not found.");

        var existingCustomer = await db.Users.AnyAsync(
            u => u.Email == email && u.Role == UserRole.Customer,
            ct);
        if (existingCustomer)
            return new CaptureSignupLeadResponse(Guid.Empty, Saved: false);

        var lead = await db.SignupLeads
            .Where(l => l.BrandId == brand.Id && l.Email == email && l.Status == SignupLeadStatus.Active)
            .OrderByDescending(l => l.UpdatedAtUtc ?? l.CreatedAtUtc)
            .FirstOrDefaultAsync(ct);

        if (lead is null)
        {
            lead = new SignupLead
            {
                BrandId = brand.Id,
                Email = email,
            };
            db.SignupLeads.Add(lead);
        }

        lead.Phone = request.Phone.Trim();
        lead.FirstName = request.FirstName.Trim();
        lead.LastName = string.IsNullOrWhiteSpace(request.LastName) ? null : request.LastName.Trim();
        lead.MarketingOptIn = request.MarketingOptIn;
        lead.LastStep = Math.Max(lead.LastStep, request.LastStep);
        lead.SelectedPlanName = string.IsNullOrWhiteSpace(request.SelectedPlanName)
            ? lead.SelectedPlanName
            : request.SelectedPlanName.Trim();
        lead.GardenSize = request.GardenSize ?? lead.GardenSize;
        lead.Postcode = string.IsNullOrWhiteSpace(request.Postcode)
            ? lead.Postcode
            : request.Postcode.Trim().ToUpperInvariant();
        lead.SessionId = string.IsNullOrWhiteSpace(request.SessionId) ? lead.SessionId : request.SessionId.Trim();
        lead.Status = SignupLeadStatus.Active;

        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "signup_lead",
            lead.LastStep == 0 ? "captured" : "updated",
            nameof(SignupLead),
            lead.Id,
            new { lead.Email, lead.LastStep, lead.MarketingOptIn },
            ct);

        return new CaptureSignupLeadResponse(lead.Id, Saved: true);
    }

    public async Task MarkConvertedAsync(string email, string brandCode = "gardens-sorted", CancellationToken ct = default)
    {
        var normalized = email.Trim().ToLowerInvariant();
        var brand = await db.Brands.FirstOrDefaultAsync(b => b.Code == brandCode && b.IsActive, ct);
        if (brand is null) return;

        var leads = await db.SignupLeads
            .Where(l => l.BrandId == brand.Id && l.Email == normalized && l.Status == SignupLeadStatus.Active)
            .ToListAsync(ct);

        if (leads.Count == 0) return;

        var now = DateTime.UtcNow;
        foreach (var lead in leads)
        {
            lead.Status = SignupLeadStatus.Converted;
            lead.ConvertedAtUtc = now;
        }

        await db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<SignupLeadSummaryResponse>> ListActiveForAdminAsync(CancellationToken ct = default)
    {
        return await db.SignupLeads
            .AsNoTracking()
            .Where(l => l.Status == SignupLeadStatus.Active)
            .OrderByDescending(l => l.UpdatedAtUtc ?? l.CreatedAtUtc)
            .Select(l => new SignupLeadSummaryResponse(
                l.Id,
                l.FirstName,
                l.LastName,
                l.Email,
                l.Phone,
                l.MarketingOptIn,
                l.LastStep,
                l.SelectedPlanName,
                l.GardenSize,
                l.Postcode,
                l.Status,
                l.CreatedAtUtc,
                l.UpdatedAtUtc))
            .ToListAsync(ct);
    }
}
