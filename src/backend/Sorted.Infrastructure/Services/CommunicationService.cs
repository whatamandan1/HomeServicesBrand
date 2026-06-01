using Microsoft.Extensions.Options;
using Sorted.Core.Communications;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Services;

public class CommunicationService(
    IEmailService email,
    ISmsService sms,
    IOptions<AppOptions> appOptions,
    IOptions<CommunicationsOptions> commsOptions) : ICommunicationService
{
    private readonly AppOptions _app = appOptions.Value;
    private readonly CommunicationsOptions _comms = commsOptions.Value;

    private string PortalLink => CommunicationTemplates.PortalLink(_app.FrontendBaseUrl);
    private string SignupLink => CommunicationTemplates.SignupLink(_app.FrontendBaseUrl);
    private string ProviderLink => CommunicationTemplates.ProviderPortalLink(_app.FrontendBaseUrl);

    public async Task NotifyWelcomeAsync(string toEmail, string? phone, string firstName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.WelcomeEmail(firstName, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.WelcomeSms(firstName), ct);
    }

    public async Task NotifySubscriptionConfirmedAsync(
        string toEmail, string? phone, string firstName, string planName, string availability, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.SubscriptionConfirmedEmail(firstName, planName, availability, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.SubscriptionConfirmedSms(planName), ct);
    }

    public async Task NotifyPasswordResetAsync(string toEmail, string resetUrl, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.PasswordResetEmail(resetUrl);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyVisitScheduledAsync(
        string toEmail, string firstName, IReadOnlyList<DateTime> visitDates, CancellationToken ct = default)
    {
        if (visitDates.Count == 0) return;
        var (subject, body) = CommunicationTemplates.VisitScheduledEmail(
            firstName, CommunicationTemplates.FormatVisitList(visitDates), PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyVisitClaimedAsync(
        string toEmail, string? phone, string firstName, DateTime visitDate, string postcode, string? window, CancellationToken ct = default)
    {
        var w = CommunicationTemplates.WindowOrDefault(window);
        var (subject, body) = CommunicationTemplates.VisitClaimedEmail(firstName, visitDate, postcode, w, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.VisitClaimedSms(visitDate, postcode), ct);
    }

    public async Task NotifyVisitReminderAsync(
        string toEmail, string? phone, string firstName, DateTime visitDate, string postcode, string? window, CancellationToken ct = default)
    {
        var w = CommunicationTemplates.WindowOrDefault(window);
        var (subject, body) = CommunicationTemplates.VisitReminderEmail(firstName, visitDate, postcode, w);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.VisitReminderSms(visitDate, postcode), ct);
    }

    public async Task NotifyVisitCompletedAsync(
        string toEmail, string? phone, string firstName, string postcode, DateTime? nextVisitDate, CancellationToken ct = default)
    {
        var nextStr = nextVisitDate?.ToString("dddd d MMMM");
        var (subject, body) = CommunicationTemplates.VisitCompletedEmail(firstName, postcode, nextStr, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.VisitCompletedSms(postcode, nextVisitDate), ct);
    }

    public async Task NotifyVisitCancelledAsync(
        string toEmail, string? phone, string firstName, DateTime visitDate, string postcode, DateTime? newDate, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.VisitCancelledEmail(firstName, visitDate, postcode, newDate, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone) && newDate is null)
            await sms.SendSmsAsync(phone, $"GardensSorted: visit on {visitDate:dd MMM} in {postcode} was cancelled.", ct);
    }

    public async Task NotifyVisitRescheduledAsync(
        string toEmail, string? phone, string firstName, DateTime oldDate, DateTime newDate, string postcode, string? window,
        bool weatherRelated = false, CancellationToken ct = default)
    {
        var w = CommunicationTemplates.WindowOrDefault(window);
        if (weatherRelated)
        {
            var (wSubject, wBody) = CommunicationTemplates.VisitWeatherRescheduledEmail(firstName, oldDate, newDate, w);
            await email.SendEmailAsync(toEmail, wSubject, wBody, ct);
        }
        else
        {
            var (subject, body) = CommunicationTemplates.VisitRescheduledEmail(firstName, oldDate, newDate, postcode, w);
            await email.SendEmailAsync(toEmail, subject, body, ct);
        }

        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.VisitRescheduledSms(newDate, postcode, w), ct);
    }

    public async Task NotifyVisitNoProviderAsync(string toEmail, string firstName, DateTime visitDate, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.VisitNoProviderEmail(firstName, visitDate);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyPaymentFailedAsync(string toEmail, string? phone, string firstName, CancellationToken ct = default)
    {
        var link = PortalLink;
        var (subject, body) = CommunicationTemplates.PaymentFailedEmail(firstName, link);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.PaymentFailedSms(link), ct);
    }

    public async Task NotifyPaymentRetryAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.PaymentRetryEmail(firstName, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyRenewalAsync(
        string toEmail, string firstName, decimal amount, string planName, DateTime periodEnd, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.RenewalEmail(firstName, amount, planName, periodEnd, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyCancellationConfirmedAsync(
        string toEmail, string? phone, string firstName, DateTime cancelsAt, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.CancelConfirmEmail(firstName, cancelsAt);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.CancelConfirmSms(cancelsAt), ct);
    }

    public async Task NotifyUpgradeConfirmedAsync(string toEmail, string firstName, string newPlanName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.UpgradeConfirmEmail(firstName, newPlanName, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyAnnualSwitchConfirmedAsync(
        string toEmail, string firstName, string planName, DateTime renewalDate, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.AnnualSwitchEmail(firstName, planName, renewalDate);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyPortfolioEnquiryAckAsync(string toEmail, string contactName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.PortfolioEnquiryAck(contactName);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyPortfolioEnquiryOpsAsync(
        string contactName, string enquiryEmail, string phone, int propertyCount, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.PortfolioEnquiryOps(contactName, enquiryEmail, phone, propertyCount);
        await email.SendOpsEmailAsync(subject, body, ct);
    }

    public async Task NotifyEscalationAckAsync(string toEmail, string firstName, string summary, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.EscalationAckEmail(firstName, summary, _comms.EscalationSlaHours);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyEscalationResolvedAsync(string toEmail, string firstName, string resolution, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.EscalationResolvedEmail(firstName, resolution);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyProviderApplyAckAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.ProviderApplyAck(firstName);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyProviderApprovedAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.ProviderApproved(firstName, ProviderLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyProviderDispatchAsync(
        string toEmail, string? phone, DateTime visitDate, string outcode, string? window, CancellationToken ct = default)
    {
        var w = CommunicationTemplates.WindowOrDefault(window);
        var (subject, body) = CommunicationTemplates.ProviderDispatchEmail(visitDate, outcode, w, ProviderLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.ProviderDispatchSms(visitDate, outcode, ProviderLink), ct);
    }

    public Task NotifyProviderVisitReminderAsync(
        string phone, DateTime visitDate, string outcode, string? window, CancellationToken ct = default)
    {
        var w = CommunicationTemplates.WindowOrDefault(window);
        return sms.SendSmsAsync(phone, CommunicationTemplates.ProviderVisitReminderSms(visitDate, outcode, w), ct);
    }

    public Task NotifyProviderVisitCancelledAsync(string phone, DateTime visitDate, string outcode, CancellationToken ct = default)
        => sms.SendSmsAsync(phone, CommunicationTemplates.ProviderVisitCancelSms(visitDate, outcode), ct);

    public async Task NotifyProviderPayoutAsync(
        string toEmail, string firstName, decimal amount, DateTime periodEnd, string? notes, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.ProviderPayoutEmail(firstName, amount, periodEnd, notes, ProviderLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyOpsPaymentFailedAsync(string customerEmail, Guid subscriptionId, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.OpsPaymentFailed(customerEmail, subscriptionId);
        await email.SendOpsEmailAsync(subject, body, ct);
    }

    public async Task NotifyOpsVisitUnclaimedAsync(DateTime visitDate, string postcode, Guid visitId, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.OpsVisitUnclaimed(visitDate, postcode, visitId);
        await email.SendOpsEmailAsync(subject, body, ct);
    }

    public async Task NotifyOpsProviderApplyAsync(string name, string enquiryEmail, string phone, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.OpsProviderApply(name, enquiryEmail, phone);
        await email.SendOpsEmailAsync(subject, body, ct);
    }

    public async Task NotifyOpsEscalationAsync(string reason, Guid escalationId, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.OpsEscalation(reason, escalationId);
        await email.SendOpsEmailAsync(subject, body, ct);
    }

    public async Task NotifyAbandonEmail1Async(SignupLead lead, CancellationToken ct = default)
    {
        var gardenSize = lead.GardenSize?.ToString();
        var (subject, body) = CommunicationTemplates.AbandonEmail1(
            lead.FirstName, lead.SelectedPlanName, gardenSize, SignupLink, _comms.DefaultCityArea);
        await email.SendEmailAsync(lead.Email, subject, body, ct);
    }

    public async Task NotifyAbandonEmail2Async(SignupLead lead, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.AbandonEmail2(lead.FirstName, lead.SelectedPlanName, SignupLink);
        await email.SendEmailAsync(lead.Email, subject, body, ct);
    }

    public async Task NotifyAbandonEmail3Async(SignupLead lead, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.AbandonEmail3(lead.FirstName, SignupLink);
        await email.SendEmailAsync(lead.Email, subject, body, ct);
    }

    public async Task NotifyAbandonSmsAsync(SignupLead lead, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(lead.Phone)) return;
        await sms.SendSmsAsync(lead.Phone, CommunicationTemplates.AbandonSms(SignupLink), ct);
    }

    public async Task NotifyCheckoutAbandonAsync(
        string toEmail, string firstName, string planName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.CheckoutAbandonEmail(firstName, planName, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyAnnualNudgeAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.AnnualNudgeEmail(firstName, PortalLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }

    public async Task NotifyReviewAskAsync(string toEmail, string? phone, string firstName, CancellationToken ct = default)
    {
        var reviewLink = string.IsNullOrWhiteSpace(_comms.GoogleReviewUrl) ? PortalLink : _comms.GoogleReviewUrl;
        var (subject, body) = CommunicationTemplates.ReviewAskEmail(firstName, reviewLink);
        await email.SendEmailAsync(toEmail, subject, body, ct);
        if (!string.IsNullOrWhiteSpace(phone))
            await sms.SendSmsAsync(phone, CommunicationTemplates.ReviewAskSms(reviewLink), ct);
    }

    public async Task NotifyWinbackAsync(string toEmail, string firstName, CancellationToken ct = default)
    {
        var (subject, body) = CommunicationTemplates.WinbackEmail(firstName);
        await email.SendEmailAsync(toEmail, subject, body, ct);
    }
}
