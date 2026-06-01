using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;
using Sorted.Infrastructure.Mapping;

namespace Sorted.Infrastructure.Services;

public class VisitManagementService(
    SortedDbContext db,
    IWorkflowLogger workflow,
    ICommunicationService communications) : IVisitManagementService
{
    public Task<JobVisitResponse> CancelVisitAsync(
        Guid visitId,
        Guid? owningCustomerId,
        bool allowInProgress,
        CancellationToken ct = default)
        => MutateVisitAsync(
            visitId,
            owningCustomerId,
            (visit, token) => CancelAsync(visit, allowInProgress, token),
            ct);

    public Task<JobVisitResponse> RescheduleVisitAsync(
        Guid visitId,
        DateTime scheduledDate,
        Guid? owningCustomerId,
        bool allowInProgress,
        CancellationToken ct = default)
        => MutateVisitAsync(
            visitId,
            owningCustomerId,
            (visit, token) => RescheduleAsync(visit, scheduledDate, allowInProgress, token),
            ct);

    private async Task<JobVisitResponse> MutateVisitAsync(
        Guid visitId,
        Guid? owningCustomerId,
        Func<JobVisit, CancellationToken, Task> mutate,
        CancellationToken ct)
    {
        var visit = await LoadVisitAsync(visitId, owningCustomerId, ct)
            ?? throw new InvalidOperationException("Visit not found.");

        await mutate(visit, ct);
        await db.SaveChangesAsync(ct);
        await SendVisitMutationNotificationsAsync(visit, ct);
        return ToResponse(visit);
    }

    private async Task SendVisitMutationNotificationsAsync(JobVisit visit, CancellationToken ct)
    {
        var user = visit.Subscription.Customer.User;
        if (visit.Status == VisitStatus.Cancelled)
        {
            await communications.NotifyVisitCancelledAsync(
                user.Email, user.Phone, user.FirstName, visit.ScheduledDate, visit.Property.Postcode, null, ct);

            if (visit.AssignedProviderId is not null)
            {
                var provider = visit.AssignedProvider;
                if (provider is not null && !string.IsNullOrWhiteSpace(provider.User.Phone))
                {
                    var outcode = Sorted.Core.Geo.PostcodeFormat.Outcode(visit.Property.Postcode);
                    await communications.NotifyProviderVisitCancelledAsync(
                        provider.User.Phone, visit.ScheduledDate, outcode, ct);
                }
            }
        }
    }

    private async Task<JobVisit?> LoadVisitAsync(Guid visitId, Guid? owningCustomerId, CancellationToken ct)
    {
        var query = db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.Subscription).ThenInclude(s => s.Customer).ThenInclude(c => c.User)
            .Include(v => v.AssignedProvider).ThenInclude(p => p!.User)
            .Where(v => v.Id == visitId && !v.IsDeleted);

        if (owningCustomerId.HasValue)
            query = query.Where(v => v.Subscription.CustomerId == owningCustomerId.Value);

        return await query.FirstOrDefaultAsync(ct);
    }

    private static void EnsureMutable(VisitStatus status, bool allowInProgress)
    {
        if (status is VisitStatus.Completed or VisitStatus.Cancelled)
            throw new InvalidOperationException("This visit can no longer be changed.");

        if (status == VisitStatus.InProgress && !allowInProgress)
            throw new InvalidOperationException("Visits in progress cannot be changed - contact support.");
    }

    private async Task CancelAsync(JobVisit visit, bool allowInProgress, CancellationToken ct)
    {
        EnsureMutable(visit.Status, allowInProgress);

        visit.Status = VisitStatus.Cancelled;
        visit.AssignedProviderId = null;
        visit.UpdatedAtUtc = DateTime.UtcNow;

        var offer = await db.DispatchOffers.FirstOrDefaultAsync(o => o.JobVisitId == visit.Id, ct);
        if (offer is not null && offer.Status != DispatchOfferStatus.Claimed)
            offer.Status = DispatchOfferStatus.Cancelled;

        await workflow.LogAsync("dispatch", "visit_cancelled", nameof(JobVisit), visit.Id, null, ct);
    }

    private async Task RescheduleAsync(JobVisit visit, DateTime scheduledDate, bool allowInProgress, CancellationToken ct)
    {
        EnsureMutable(visit.Status, allowInProgress);

        var newDate = scheduledDate.Date;
        if (newDate < DateTime.UtcNow.Date)
            throw new InvalidOperationException("New date must be today or in the future.");

        var previousDate = visit.ScheduledDate;
        visit.ScheduledDate = newDate;
        visit.UpdatedAtUtc = DateTime.UtcNow;
        visit.ReminderSentAtUtc = null;

        if (visit.Status is VisitStatus.Claimed or VisitStatus.InProgress)
            visit.Status = VisitStatus.Rescheduled;

        await workflow.LogAsync(
            "dispatch",
            "visit_rescheduled",
            nameof(JobVisit),
            visit.Id,
            new { previousDate, scheduledDate = newDate },
            ct);

        var user = visit.Subscription.Customer.User;
        await communications.NotifyVisitRescheduledAsync(
            user.Email,
            user.Phone,
            user.FirstName,
            previousDate,
            newDate,
            visit.Property.Postcode,
            visit.AvailabilityWindow,
            weatherRelated: false,
            ct);
    }

    private static JobVisitResponse ToResponse(JobVisit visit) =>
        JobVisitResponseMapper.FromEntity(visit);
}
