namespace Sorted.Core.Options;

public class JwtOptions
{
    public const string Section = "Jwt";
    public string Issuer { get; set; } = "Sorted";
    public string Audience { get; set; } = "Sorted";
    public string Secret { get; set; } = "CHANGE_ME_IN_PRODUCTION_USE_LONG_SECRET";
    public int ExpiryHours { get; set; } = 72;
}

public class StripeOptions
{
    public const string Section = "Stripe";
    public string SecretKey { get; set; } = string.Empty;
    public string WebhookSecret { get; set; } = string.Empty;
    public string SuccessUrl { get; set; } = "http://localhost:3000/signup/success";
    public string CancelUrl { get; set; } = "http://localhost:3000/signup";
}

public class SendGridOptions
{
    public const string Section = "SendGrid";
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = "hello@gardenssorted.co.uk";
    public string FromName { get; set; } = "GardensSorted";
}

public class OpenAiOptions
{
    public const string Section = "OpenAI";
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = "gpt-4o-mini";
}
