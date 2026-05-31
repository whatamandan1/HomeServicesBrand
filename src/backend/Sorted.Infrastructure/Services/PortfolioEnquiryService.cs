using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class PortfolioEnquiryService(
    SortedDbContext db,
    IWorkflowLogger workflow,
    IServiceScopeFactory scopeFactory,
    IOptions<AppOptions> appOptions) : IPortfolioEnquiryService
{
    private readonly AppOptions _appOptions = appOptions.Value;

    public async Task<PortfolioEnquirySubmittedResponse> SubmitAsync(
        SubmitPortfolioEnquiryRequest request,
        CancellationToken ct = default)
    {
        if (request.Properties.Count < 2)
            throw new InvalidOperationException("Add at least two properties to request a portfolio quote.");

        var brandCode = string.IsNullOrWhiteSpace(request.BrandCode) ? "gardens-sorted" : request.BrandCode.Trim();
        var brand = await db.Brands.FirstOrDefaultAsync(b => b.Code == brandCode && b.IsActive, ct)
            ?? throw new InvalidOperationException("Brand not found.");

        var enquiry = new PortfolioEnquiry
        {
            BrandId = brand.Id,
            ContactName = request.ContactName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Phone = request.Phone.Trim(),
            CompanyName = string.IsNullOrWhiteSpace(request.CompanyName) ? null : request.CompanyName.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Status = PortfolioEnquiryStatus.New,
        };

        db.PortfolioEnquiries.Add(enquiry);

        for (var i = 0; i < request.Properties.Count; i++)
        {
            var property = request.Properties[i];
            if (string.IsNullOrWhiteSpace(property.Line1) || string.IsNullOrWhiteSpace(property.City)
                || string.IsNullOrWhiteSpace(property.Postcode))
            {
                throw new InvalidOperationException("Each property needs an address line, city, and postcode.");
            }

            db.PortfolioEnquiryProperties.Add(new PortfolioEnquiryProperty
            {
                Enquiry = enquiry,
                SortOrder = i,
                Line1 = property.Line1.Trim(),
                Line2 = string.IsNullOrWhiteSpace(property.Line2) ? null : property.Line2.Trim(),
                City = property.City.Trim(),
                Postcode = property.Postcode.Trim().ToUpperInvariant(),
                GardenSize = property.GardenSize,
            });
        }

        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "portfolio_enquiry",
            "received",
            nameof(PortfolioEnquiry),
            enquiry.Id,
            new { enquiry.Email, PropertyCount = request.Properties.Count },
            ct);

        QueueNotificationEmails(enquiry.ContactName, enquiry.Email, enquiry.Phone, request.Properties.Count);

        return new PortfolioEnquirySubmittedResponse(
            enquiry.Id,
            "Thanks - we've received your multi-property enquiry. We'll review your properties and be in touch with a personalised quote.");
    }

    public async Task<IReadOnlyList<PortfolioEnquirySummaryResponse>> ListForAdminAsync(CancellationToken ct = default)
    {
        return await db.PortfolioEnquiries.AsNoTracking()
            .Where(e => !e.IsDeleted)
            .OrderByDescending(e => e.CreatedAtUtc)
            .Select(e => new PortfolioEnquirySummaryResponse(
                e.Id,
                e.ContactName,
                e.Email,
                e.Phone,
                e.CompanyName,
                e.Status,
                e.Properties.Count(p => !p.IsDeleted),
                e.CreatedAtUtc))
            .ToListAsync(ct);
    }

    public async Task<PortfolioEnquiryDetailResponse?> GetForAdminAsync(Guid enquiryId, CancellationToken ct = default)
    {
        var enquiry = await db.PortfolioEnquiries.AsNoTracking()
            .Include(e => e.Properties.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(e => e.Id == enquiryId && !e.IsDeleted, ct);

        return enquiry is null ? null : MapDetail(enquiry);
    }

    public async Task<PortfolioEnquiryDetailResponse> UpdateStatusAsync(
        Guid enquiryId,
        PortfolioEnquiryStatus status,
        CancellationToken ct = default)
    {
        var enquiry = await db.PortfolioEnquiries
            .Include(e => e.Properties.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(e => e.Id == enquiryId && !e.IsDeleted, ct)
            ?? throw new InvalidOperationException("Portfolio enquiry not found.");

        enquiry.Status = status;
        enquiry.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "portfolio_enquiry",
            "status_updated",
            nameof(PortfolioEnquiry),
            enquiry.Id,
            new { status = status.ToString() },
            ct);

        return MapDetail(enquiry);
    }

    private void QueueNotificationEmails(string contactName, string email, string phone, int propertyCount)
    {
        var opsEmail = _appOptions.OpsNotificationEmail;
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var mail = scope.ServiceProvider.GetRequiredService<IEmailService>();
                await mail.SendPortfolioEnquiryAckAsync(email, contactName);
                if (!string.IsNullOrWhiteSpace(opsEmail))
                    await mail.SendPortfolioEnquiryAdminNotifyAsync(opsEmail, contactName, email, phone, propertyCount);
            }
            catch
            {
                // Notifications must not block enquiry submission.
            }
        });
    }

    private static PortfolioEnquiryDetailResponse MapDetail(PortfolioEnquiry enquiry)
    {
        var properties = enquiry.Properties
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .Select(p => new PortfolioEnquiryPropertyResponse(
                p.Id,
                p.SortOrder,
                p.Line1,
                p.Line2,
                p.City,
                p.Postcode,
                p.GardenSize))
            .ToList();

        return new PortfolioEnquiryDetailResponse(
            enquiry.Id,
            enquiry.ContactName,
            enquiry.Email,
            enquiry.Phone,
            enquiry.CompanyName,
            enquiry.Notes,
            enquiry.Status,
            enquiry.CreatedAtUtc,
            properties);
    }
}
