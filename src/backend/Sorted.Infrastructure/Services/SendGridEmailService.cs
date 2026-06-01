using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Services;

public class SendGridEmailService(
    IOptions<SendGridOptions> options,
    IOptions<AppOptions> appOptions,
    ILogger<SendGridEmailService> logger) : IEmailService
{
    private readonly SendGridOptions _options = options.Value;
    private readonly AppOptions _appOptions = appOptions.Value;

    public Task SendEmailAsync(string toEmail, string subject, string plainText, CancellationToken ct = default)
        => SendAsync(toEmail, subject, plainText, ct);

    public Task SendOpsEmailAsync(string subject, string plainText, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_appOptions.OpsNotificationEmail))
        {
            logger.LogInformation("Ops email skipped (no OpsNotificationEmail): {Subject}", subject);
            return Task.CompletedTask;
        }

        return SendAsync(_appOptions.OpsNotificationEmail, subject, plainText, ct);
    }

    private async Task SendAsync(string toEmail, string subject, string plainText, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            logger.LogInformation("SendGrid not configured. Email skipped: {Subject} -> {Email}", subject, toEmail);
            return;
        }

        var client = new SendGridClient(_options.ApiKey);
        var html = string.Join("", plainText.Split('\n').Select(line => $"<p>{line}</p>"));
        var msg = MailHelper.CreateSingleEmail(
            new EmailAddress(_options.FromEmail, _options.FromName),
            new EmailAddress(toEmail),
            subject,
            plainText,
            html);

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
