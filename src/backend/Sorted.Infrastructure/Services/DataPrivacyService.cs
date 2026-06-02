using Microsoft.EntityFrameworkCore;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class DataPrivacyService(
    SortedDbContext db,
    IStripePaymentService stripe,
    IWorkflowLogger workflow) : IDataPrivacyService
{
    public async Task<object> ExportUserDataAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await db.Users.AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, ct)
            ?? throw new InvalidOperationException("Account not found.");

        var exportedAt = DateTime.UtcNow;

        if (user.Role == UserRole.Customer)
        {
            var customer = await db.Customers.AsNoTracking()
                .Include(c => c.Properties)
                .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted, ct)
                ?? throw new InvalidOperationException("Customer profile not found.");

            var subscriptions = await db.CustomerSubscriptions.AsNoTracking()
                .Include(s => s.Plan)
                .Where(s => s.CustomerId == customer.Id && !s.IsDeleted)
                .ToListAsync(ct);

            var visits = await db.JobVisits.AsNoTracking()
                .Include(v => v.Property)
                .Include(v => v.AssignedProvider).ThenInclude(p => p!.User)
                .Where(v => v.Subscription.CustomerId == customer.Id && !v.IsDeleted)
                .OrderByDescending(v => v.ScheduledDate)
                .ToListAsync(ct);

            var payments = await db.Payments.AsNoTracking()
                .Include(p => p.Subscription).ThenInclude(s => s.Plan)
                .Where(p => p.Subscription.CustomerId == customer.Id && !p.IsDeleted)
                .OrderByDescending(p => p.CreatedAtUtc)
                .ToListAsync(ct);

            var threads = await db.CommunicationThreads.AsNoTracking()
                .Include(t => t.Messages)
                .Where(t => t.CustomerId == customer.Id && !t.IsDeleted)
                .OrderByDescending(t => t.UpdatedAtUtc ?? t.CreatedAtUtc)
                .ToListAsync(ct);

            var escalations = await db.Escalations.AsNoTracking()
                .Where(e => e.CustomerId == customer.Id && !e.IsDeleted)
                .OrderByDescending(e => e.CreatedAtUtc)
                .ToListAsync(ct);

            return new
            {
                exportedAtUtc = exportedAt,
                role = user.Role.ToString(),
                profile = Profile(user),
                properties = customer.Properties
                    .Where(p => !p.IsDeleted)
                    .Select(p => new
                    {
                        p.Id,
                        p.Line1,
                        p.Line2,
                        p.City,
                        p.Postcode,
                        p.GardenSize,
                        p.AccessNotes,
                        p.IsPrimary,
                        p.CreatedAtUtc,
                        photoCount = db.PropertyMedia.Count(m => m.CustomerPropertyId == p.Id && !m.IsDeleted)
                    }),
                subscriptions = subscriptions.Select(s => new
                {
                    s.Id,
                    planName = s.Plan.Name,
                    billingInterval = s.Plan.BillingInterval.ToString(),
                    status = s.Status.ToString(),
                    s.StartedAtUtc,
                    s.EndsAtUtc,
                    s.CancelsAtUtc,
                    s.AvailabilityPreference,
                    s.CreatedAtUtc
                }),
                visits = visits.Select(v => new
                {
                    v.Id,
                    v.ScheduledDate,
                    v.AvailabilityWindow,
                    status = v.Status.ToString(),
                    postcode = v.Property.Postcode,
                    assignedProvider = v.AssignedProvider is null
                        ? null
                        : $"{v.AssignedProvider.User.FirstName} {v.AssignedProvider.User.LastName}".Trim(),
                    v.ClaimedAtUtc,
                    v.CreatedAtUtc
                }),
                payments = payments.Select(p => new
                {
                    p.Id,
                    planName = p.Subscription.Plan.Name,
                    p.AmountGbp,
                    status = p.Status.ToString(),
                    p.CreatedAtUtc,
                    p.StripeInvoiceId
                }),
                communicationThreads = threads.Select(t => new
                {
                    t.Id,
                    t.Subject,
                    t.CreatedAtUtc,
                    t.UpdatedAtUtc,
                    messages = t.Messages
                        .Where(m => !m.IsDeleted)
                        .OrderBy(m => m.CreatedAtUtc)
                        .Select(m => new
                        {
                            m.Id,
                            m.SenderRole,
                            m.Body,
                            m.CreatedAtUtc
                        })
                }),
                escalations = escalations.Select(e => new
                {
                    e.Id,
                    e.Reason,
                    status = e.Status.ToString(),
                    e.Notes,
                    e.CreatedAtUtc,
                    e.UpdatedAtUtc
                })
            };
        }

        if (user.Role == UserRole.Provider)
        {
            var provider = await db.Providers.AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == userId && !p.IsDeleted, ct)
                ?? throw new InvalidOperationException("Provider profile not found.");

            var visits = await db.JobVisits.AsNoTracking()
                .Include(v => v.Property)
                .Where(v => v.AssignedProviderId == provider.Id && !v.IsDeleted)
                .OrderByDescending(v => v.ScheduledDate)
                .ToListAsync(ct);

            var earnings = await db.ProviderEarnings.AsNoTracking()
                .Where(e => e.ProviderId == provider.Id && !e.IsDeleted)
                .OrderByDescending(e => e.CreatedAtUtc)
                .ToListAsync(ct);

            return new
            {
                exportedAtUtc = exportedAt,
                role = user.Role.ToString(),
                profile = Profile(user),
                provider = new
                {
                    provider.Id,
                    provider.CoveragePostcode,
                    provider.CoverageRadiusMiles,
                    provider.IsApproved,
                    provider.CreatedAtUtc
                },
                visits = visits.Select(v => new
                {
                    v.Id,
                    v.ScheduledDate,
                    v.AvailabilityWindow,
                    status = v.Status.ToString(),
                    postcode = v.Property.Postcode,
                    v.ClaimedAtUtc,
                    v.CreatedAtUtc
                }),
                earnings = earnings.Select(e => new
                {
                    e.Id,
                    e.AmountGbp,
                    status = e.Status.ToString(),
                    e.PaidAtUtc,
                    e.CreatedAtUtc
                })
            };
        }

        return new
        {
            exportedAtUtc = exportedAt,
            role = user.Role.ToString(),
            profile = Profile(user)
        };
    }

    public async Task DeleteAccountAsync(Guid userId, string confirmation, CancellationToken ct = default)
    {
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, ct)
            ?? throw new InvalidOperationException("Account not found.");

        if (user.Role == UserRole.Admin)
            throw new InvalidOperationException("Admin accounts cannot be deleted through this endpoint.");

        if (!string.Equals(confirmation.Trim(), user.Email, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Confirmation must match your account email exactly.");

        if (user.Role == UserRole.Customer)
            await DeleteCustomerAsync(user, ct);
        else if (user.Role == UserRole.Provider)
            await DeleteProviderAsync(user, ct);
        else
            throw new InvalidOperationException("This account type cannot be deleted online. Contact support.");

        await workflow.LogAsync("privacy", "account_deleted", nameof(UserAccount), user.Id, new { user.Role }, ct);
    }

    private async Task DeleteCustomerAsync(UserAccount user, CancellationToken ct)
    {
        var customer = await db.Customers
            .Include(c => c.Subscriptions)
            .Include(c => c.Properties)
            .FirstOrDefaultAsync(c => c.UserId == user.Id && !c.IsDeleted, ct)
            ?? throw new InvalidOperationException("Customer profile not found.");

        foreach (var sub in customer.Subscriptions.Where(s => !s.IsDeleted && s.Status is SubscriptionStatus.Active or SubscriptionStatus.PastDue))
        {
            try
            {
                await stripe.CancelSubscriptionAsync(sub, ct);
            }
            catch (InvalidOperationException)
            {
                sub.Status = SubscriptionStatus.Cancelled;
                sub.CancelsAtUtc = DateTime.UtcNow;
            }
        }

        var visits = await db.JobVisits
            .Where(v => v.Subscription.CustomerId == customer.Id
                && !v.IsDeleted
                && (v.Status == VisitStatus.Claimed || v.Status == VisitStatus.OpenForClaim))
            .ToListAsync(ct);

        foreach (var visit in visits)
        {
            visit.Status = VisitStatus.OpenForClaim;
            visit.AssignedProviderId = null;
            visit.ClaimedAtUtc = null;
            visit.UpdatedAtUtc = DateTime.UtcNow;
        }

        foreach (var property in customer.Properties.Where(p => !p.IsDeleted))
        {
            property.IsDeleted = true;
            property.UpdatedAtUtc = DateTime.UtcNow;
        }

        customer.IsDeleted = true;
        customer.UpdatedAtUtc = DateTime.UtcNow;

        AnonymizeUser(user);
        await db.SaveChangesAsync(ct);
    }

    private async Task DeleteProviderAsync(UserAccount user, CancellationToken ct)
    {
        var provider = await db.Providers
            .FirstOrDefaultAsync(p => p.UserId == user.Id && !p.IsDeleted, ct)
            ?? throw new InvalidOperationException("Provider profile not found.");

        var assignedVisits = await db.JobVisits
            .Where(v => v.AssignedProviderId == provider.Id
                && !v.IsDeleted
                && (v.Status == VisitStatus.Claimed || v.Status == VisitStatus.InProgress))
            .ToListAsync(ct);

        foreach (var visit in assignedVisits)
        {
            visit.Status = VisitStatus.OpenForClaim;
            visit.AssignedProviderId = null;
            visit.ClaimedAtUtc = null;
            visit.UpdatedAtUtc = DateTime.UtcNow;
        }

        provider.IsDeleted = true;
        provider.IsApproved = false;
        provider.UpdatedAtUtc = DateTime.UtcNow;

        AnonymizeUser(user);
        await db.SaveChangesAsync(ct);
    }

    private static object Profile(UserAccount user) => new
    {
        user.Id,
        user.Email,
        user.FirstName,
        user.LastName,
        user.Phone,
        role = user.Role.ToString(),
        user.CreatedAtUtc
    };

    private static void AnonymizeUser(UserAccount user)
    {
        var token = user.Id.ToString("N")[..8];
        user.Email = $"deleted-{token}@anonymized.local";
        user.FirstName = "Deleted";
        user.LastName = "User";
        user.Phone = null;
        user.PasswordHash = string.Empty;
        user.IsActive = false;
        user.IsDeleted = true;
        user.UpdatedAtUtc = DateTime.UtcNow;
    }
}
