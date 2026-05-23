using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;

namespace Sorted.Infrastructure.Services;

public class TwilioSmsService(IOptions<TwilioOptions> options, ILogger<TwilioSmsService> logger) : ISmsService
{
    private readonly TwilioOptions _options = options.Value;

    public Task SendWelcomeSmsAsync(string toPhone, string firstName, CancellationToken ct = default)
        => SendAsync(toPhone,
            $"Hi {firstName}, welcome to GardensSorted! Your garden subscription account is ready.",
            ct);

    public Task SendSubscriptionConfirmedSmsAsync(string toPhone, string planName, CancellationToken ct = default)
        => SendAsync(toPhone,
            $"GardensSorted: your {planName} subscription is active. We'll confirm your first visit window soon.",
            ct);

    public Task SendVisitClaimedSmsAsync(string toPhone, DateTime visitDate, string postcode, CancellationToken ct = default)
        => SendAsync(toPhone,
            $"GardensSorted: visit confirmed for {visitDate:dd MMM} in {postcode}. Your gardener will arrive in your chosen window.",
            ct);

    public Task SendVisitReminderSmsAsync(string toPhone, DateTime visitDate, string postcode, CancellationToken ct = default)
        => SendAsync(toPhone,
            $"GardensSorted reminder: garden visit on {visitDate:dd MMM} in {postcode}. We'll arrive in your chosen window.",
            ct);

    private async Task SendAsync(string toPhone, string body, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(_options.AccountSid)
            || string.IsNullOrWhiteSpace(_options.AuthToken)
            || string.IsNullOrWhiteSpace(_options.FromPhoneNumber))
        {
            logger.LogInformation("Twilio not configured. SMS skipped.");
            return;
        }

        var to = UkPhoneNumber.ToE164(toPhone);
        if (to is null)
        {
            logger.LogWarning("Invalid phone number for SMS: {Phone}", toPhone);
            return;
        }

        try
        {
            TwilioClient.Init(_options.AccountSid, _options.AuthToken);
            var message = await MessageResource.CreateAsync(
                to: new PhoneNumber(to),
                from: new PhoneNumber(_options.FromPhoneNumber),
                body: body);

            logger.LogInformation("Twilio SMS sent {Sid} -> {To}", message.Sid, to);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Twilio SMS failed -> {To}", to);
        }
    }
}
