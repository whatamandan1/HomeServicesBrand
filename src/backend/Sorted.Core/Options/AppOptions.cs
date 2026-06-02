namespace Sorted.Core.Options;

using Sorted.Core.Enums;
using Sorted.Core.Plans;

public class GoogleMapsOptions
{
    public const string Section = "GoogleMaps";
    /// <summary>Maps Static API key for satellite imagery used in garden-size suggestions.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

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
    public string BillingPortalReturnUrl { get; set; } = "http://localhost:3000/portal";
    /// <summary>Optional Stripe Customer Portal configuration (bpc_...). When unset, the API creates one with cancellation disabled.</summary>
    public string BillingPortalConfigurationId { get; set; } = string.Empty;
    /// <summary>Optional pre-created Stripe Price IDs (recommended for production).</summary>
    public StripePriceOptions Prices { get; set; } = new();
}

public class StripePriceOptions
{
    public string EssentialMonthly { get; set; } = string.Empty;
    public string EssentialAnnual { get; set; } = string.Empty;
    public string PremiumMonthly { get; set; } = string.Empty;
    public string PremiumAnnual { get; set; } = string.Empty;
    public string EliteMonthly { get; set; } = string.Empty;
    public string EliteAnnual { get; set; } = string.Empty;
}

public class PlanPricingOptions
{
    public const string Section = "Plans";
    public decimal EssentialMonthly { get; set; } = GardenSizePricing.EssentialMonthlyPriceGbp(GardenSize.Small);
    public decimal EssentialAnnual { get; set; } = GardenSizePricing.AnnualPriceGbp("Essential Annual", GardenSize.Small);
    public decimal PremiumMonthly { get; set; } = GardenSizePricing.MonthlyPriceGbp("Premium Monthly", GardenSize.Small);
    public decimal PremiumAnnual { get; set; } = GardenSizePricing.AnnualPriceGbp("Premium Annual", GardenSize.Small);
    public decimal EliteMonthly { get; set; } = GardenSizePricing.MonthlyPriceGbp("Elite Monthly", GardenSize.Small);
    public decimal EliteAnnual { get; set; } = GardenSizePricing.AnnualPriceGbp("Elite Annual", GardenSize.Small);
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

public class AppOptions
{
    public const string Section = "App";
    public string FrontendBaseUrl { get; set; } = "http://localhost:3000";
    /// <summary>Ops inbox for portfolio enquiries and similar alerts.</summary>
    public string OpsNotificationEmail { get; set; } = string.Empty;
}

public class SentryOptions
{
    public const string Section = "Sentry";
    /// <summary>Sentry DSN (optional). When unset, error tracking is disabled.</summary>
    public string Dsn { get; set; } = string.Empty;
    public string Environment { get; set; } = "development";
    public double TracesSampleRate { get; set; } = 0.1;
}

public class FeaturesOptions
{
    public const string Section = "Features";
    /// <summary>Skip Stripe checkout - activate subscription immediately (staging/dev only).</summary>
    public bool BypassStripeCheckout { get; set; }
    /// <summary>Create demo admin/provider accounts and sample dispatch data on startup.</summary>
    public bool SeedDemoData { get; set; } = true;
}

public class TwilioOptions
{
    public const string Section = "Twilio";
    public string AccountSid { get; set; } = string.Empty;
    public string AuthToken { get; set; } = string.Empty;
    /// <summary>E.164 format, e.g. +447700900000 (your Twilio number).</summary>
    public string FromPhoneNumber { get; set; } = string.Empty;
}

public class BackgroundJobsOptions
{
    public const string Section = "BackgroundJobs";
    public bool Enabled { get; set; } = true;
    public int IntervalMinutes { get; set; } = 60;
    public int TargetFutureVisits { get; set; } = 4;
    /// <summary>Legacy default - visit spacing now comes from <see cref="Plans.PlanCatalog.VisitIntervalDays"/> per plan.</summary>
    public int VisitIntervalDays { get; set; } = 7;
    public int DispatchOfferExpiryDays { get; set; } = 3;
    public int DispatchOpenWithinDays { get; set; } = 14;
    public int ReminderLeadHours { get; set; } = 24;
}

public class ProviderPayoutOptions
{
    public const string Section = "ProviderPayout";
    /// <summary>Fixed pay per completed visit (small garden) - same for Essential, Premium, and Elite.</summary>
    public decimal SmallVisitGbp { get; set; } = ProviderVisitPay.ForGardenSize(GardenSize.Small);
    public decimal MediumVisitGbp { get; set; } = ProviderVisitPay.ForGardenSize(GardenSize.Medium);
    public decimal LargeVisitGbp { get; set; } = ProviderVisitPay.ForGardenSize(GardenSize.Large);
}
