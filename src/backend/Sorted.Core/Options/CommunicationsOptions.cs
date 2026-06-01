namespace Sorted.Core.Options;

public class CommunicationsOptions
{
    public const string Section = "Communications";
    public string GoogleReviewUrl { get; set; } = string.Empty;
    public string ReferralBaseUrl { get; set; } = string.Empty;
    public string DefaultCityArea { get; set; } = "Leeds";
    public int EscalationSlaHours { get; set; } = 24;
}
