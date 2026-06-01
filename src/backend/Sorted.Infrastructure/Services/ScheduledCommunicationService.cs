using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class ScheduledCommunicationService(
    SortedDbContext db,
    ICommunicationService communications,
    ILogger<ScheduledCommunicationService> logger) : IScheduledCommunicationService
{
    public async Task RunScheduledNotificationsAsync(CancellationToken ct = default)
    {
        await ProcessSignupAbandonSequencesAsync(ct);
        await ProcessCheckoutAbandonAsync(ct);
        await ProcessReviewAsksAsync(ct);
        await ProcessAnnualNudgesAsync(ct);
        await ProcessWinbackAsync(ct);
        await ProcessUnclaimedVisitAlertsAsync(ct);
        await ProcessProviderVisitRemindersAsync(ct);
    }

    private async Task ProcessSignupAbandonSequencesAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var leads = await db.SignupLeads
            .Where(l => l.Status == SignupLeadStatus.Active && !l.IsDeleted)
            .ToListAsync(ct);

        foreach (var lead in leads)
        {
            try
            {
                if (lead.AbandonEmail1SentAtUtc is null && now - lead.CreatedAtUtc >= TimeSpan.FromHours(1))
                {
                    await communications.NotifyAbandonEmail1Async(lead, ct);
                    lead.AbandonEmail1SentAtUtc = now;
                }
                else if (lead.AbandonEmail1SentAtUtc is not null
                         && lead.AbandonEmail2SentAtUtc is null
                         && now - lead.AbandonEmail1SentAtUtc >= TimeSpan.FromHours(23))
                {
                    await communications.NotifyAbandonEmail2Async(lead, ct);
                    lead.AbandonEmail2SentAtUtc = now;
                }
                else if (lead.AbandonEmail2SentAtUtc is not null
                         && lead.AbandonEmail3SentAtUtc is null
                         && now - lead.AbandonEmail2SentAtUtc >= TimeSpan.FromHours(48))
                {
                    await communications.NotifyAbandonEmail3Async(lead, ct);
                    lead.AbandonEmail3SentAtUtc = now;
                }

                if (lead.AbandonSmsSentAtUtc is null
                    && !string.IsNullOrWhiteSpace(lead.Phone)
                    && lead.AbandonEmail1SentAtUtc is not null
                    && now - lead.AbandonEmail1SentAtUtc >= TimeSpan.FromHours(23))
                {
                    await communications.NotifyAbandonSmsAsync(lead, ct);
                    lead.AbandonSmsSentAtUtc = now;
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed abandon notification for lead {LeadId}", lead.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ProcessCheckoutAbandonAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddHours(-2);
        var subs = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Plan)
            .Where(s =>
                s.Status == SubscriptionStatus.PendingPayment
                && s.CheckoutAbandonEmailSentAtUtc == null
                && s.CreatedAtUtc <= cutoff
                && !s.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var sub in subs)
        {
            try
            {
                var user = sub.Customer.User;
                await communications.NotifyCheckoutAbandonAsync(user.Email, user.FirstName, sub.Plan.Name, ct);
                sub.CheckoutAbandonEmailSentAtUtc = now;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed checkout abandon email for subscription {SubscriptionId}", sub.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ProcessReviewAsksAsync(CancellationToken ct)
    {
        var cutoff = DateTime.UtcNow.AddHours(-24);
        var visits = await db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.Subscription).ThenInclude(s => s.Customer).ThenInclude(c => c.User)
            .Where(v =>
                v.Status == VisitStatus.Completed
                && v.CompletionNotifiedAtUtc != null
                && v.ReviewAskSentAtUtc == null
                && v.UpdatedAtUtc <= cutoff
                && !v.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var visit in visits)
        {
            var customerId = visit.Subscription.CustomerId;
            var priorCompleted = await db.JobVisits.CountAsync(v =>
                v.Subscription.CustomerId == customerId
                && v.Status == VisitStatus.Completed
                && v.Id != visit.Id
                && !v.IsDeleted, ct);

            if (priorCompleted > 0)
                continue;

            try
            {
                var user = visit.Subscription.Customer.User;
                await communications.NotifyReviewAskAsync(user.Email, user.Phone, user.FirstName, ct);
                visit.ReviewAskSentAtUtc = now;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed review ask for visit {VisitId}", visit.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ProcessAnnualNudgesAsync(CancellationToken ct)
    {
        var threshold = DateTime.UtcNow.AddDays(-60);
        var subs = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Plan)
            .Where(s =>
                s.Status == SubscriptionStatus.Active
                && s.AnnualNudgeSentAtUtc == null
                && s.StartedAtUtc != null
                && s.StartedAtUtc <= threshold
                && s.Plan.BillingInterval == SubscriptionBillingInterval.Monthly
                && !s.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var sub in subs)
        {
            try
            {
                var user = sub.Customer.User;
                await communications.NotifyAnnualNudgeAsync(user.Email, user.FirstName, ct);
                sub.AnnualNudgeSentAtUtc = now;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed annual nudge for subscription {SubscriptionId}", sub.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ProcessWinbackAsync(CancellationToken ct)
    {
        var threshold = DateTime.UtcNow.AddDays(-14);
        var subs = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Where(s =>
                s.Status == SubscriptionStatus.Cancelled
                && s.WinbackEmailSentAtUtc == null
                && s.CancelsAtUtc != null
                && s.CancelsAtUtc <= threshold
                && !s.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var sub in subs)
        {
            try
            {
                var user = sub.Customer.User;
                await communications.NotifyWinbackAsync(user.Email, user.FirstName, ct);
                sub.WinbackEmailSentAtUtc = now;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed winback email for subscription {SubscriptionId}", sub.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ProcessUnclaimedVisitAlertsAsync(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var alertFrom = now.Date.AddDays(5);
        var alertTo = now.Date.AddDays(6);

        var visits = await db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.Subscription).ThenInclude(s => s.Customer).ThenInclude(c => c.User)
            .Where(v =>
                v.Status == VisitStatus.OpenForClaim
                && v.UnclaimedOpsAlertSentAtUtc == null
                && v.ScheduledDate >= alertFrom
                && v.ScheduledDate < alertTo
                && !v.IsDeleted)
            .ToListAsync(ct);

        foreach (var visit in visits)
        {
            try
            {
                await communications.NotifyOpsVisitUnclaimedAsync(
                    visit.ScheduledDate, visit.Property.Postcode, visit.Id, ct);

                var user = visit.Subscription.Customer.User;
                await communications.NotifyVisitNoProviderAsync(user.Email, user.FirstName, visit.ScheduledDate, ct);

                visit.UnclaimedOpsAlertSentAtUtc = now;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed unclaimed alert for visit {VisitId}", visit.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }

    private async Task ProcessProviderVisitRemindersAsync(CancellationToken ct)
    {
        var tomorrow = DateTime.UtcNow.Date.AddDays(1);
        var visits = await db.JobVisits
            .Include(v => v.Property)
            .Include(v => v.AssignedProvider).ThenInclude(p => p!.User)
            .Where(v =>
                v.Status == VisitStatus.Claimed
                && v.ProviderReminderSentAtUtc == null
                && v.ScheduledDate == tomorrow
                && v.AssignedProviderId != null
                && !v.IsDeleted)
            .ToListAsync(ct);

        var now = DateTime.UtcNow;
        foreach (var visit in visits)
        {
            var phone = visit.AssignedProvider!.User.Phone;
            if (string.IsNullOrWhiteSpace(phone))
                continue;

            try
            {
                var outcode = PostcodeFormat.Outcode(visit.Property.Postcode);
                await communications.NotifyProviderVisitReminderAsync(
                    phone, visit.ScheduledDate, outcode, visit.AvailabilityWindow, ct);
                visit.ProviderReminderSentAtUtc = now;
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed provider reminder for visit {VisitId}", visit.Id);
            }
        }

        await db.SaveChangesAsync(ct);
    }
}
