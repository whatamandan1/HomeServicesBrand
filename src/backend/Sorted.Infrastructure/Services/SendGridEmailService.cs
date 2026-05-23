using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Services;

public class SendGridEmailService(IOptions<SendGridOptions> options, ILogger<SendGridEmailService> logger) : IEmailService
{
    private readonly SendGridOptions _options = options.Value;

    public Task SendWelcomeEmailAsync(string toEmail, string firstName, CancellationToken ct = default)
        => SendAsync(toEmail, "Welcome to GardensSorted", $"Hi {firstName}, welcome to GardensSorted! We're glad you're here.", ct);

    public Task SendSubscriptionConfirmedEmailAsync(string toEmail, string planName, CancellationToken ct = default)
        => SendAsync(toEmail, "Your GardensSorted subscription is active",
            $"Your {planName} subscription is now active. We'll be in touch with your first visit window soon.", ct);

    public Task SendVisitReminderEmailAsync(string toEmail, DateTime visitDate, string postcode, string availabilityWindow, CancellationToken ct = default)
    {
        var window = string.IsNullOrWhiteSpace(availabilityWindow) ? "your chosen window" : availabilityWindow;
        return SendAsync(toEmail, "Reminder: your GardensSorted visit is coming up",
            $"Your garden visit is scheduled for {visitDate:dddd d MMMM} in {postcode}. We'll arrive during {window}.", ct);
    }

    public Task SendVisitClaimedEmailAsync(string toEmail, DateTime visitDate, string postcode, string availabilityWindow, CancellationToken ct = default)
    {
        var window = string.IsNullOrWhiteSpace(availabilityWindow) ? "your chosen window" : availabilityWindow;
        return SendAsync(toEmail, "Your GardensSorted visit is confirmed",
            $"Your garden visit on {visitDate:dddd d MMMM} in {postcode} is confirmed. Your gardener will arrive during {window}.", ct);
    }

    private async Task SendAsync(string toEmail, string subject, string plainText, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            logger.LogInformation("SendGrid not configured. Email skipped: {Subject} -> {Email}", subject, toEmail);
            return;
        }

        var client = new SendGridClient(_options.ApiKey);
        var msg = MailHelper.CreateSingleEmail(
            new EmailAddress(_options.FromEmail, _options.FromName),
            new EmailAddress(toEmail),
            subject,
            plainText,
            $"<p>{plainText}</p>");

        var response = await client.SendEmailAsync(msg, ct);
        if (response.IsSuccessStatusCode)
        {
            logger.LogInformation("SendGrid sent {Subject} -> {Email}", subject, toEmail);
            return;
        }

        var body = await response.Body.ReadAsStringAsync(ct);
        logger.LogWarning("SendGrid {Status} for {Subject} -> {Email}: {Body}",
            response.StatusCode, subject, toEmail, body);
    }
}
