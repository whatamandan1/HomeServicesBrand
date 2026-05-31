namespace Sorted.Core;

/// <summary>
/// Parses customer free-text availability preferences into a time-of-day window (UK local convention).
/// </summary>
public readonly record struct CustomerTimeWindow(int StartMinutes, int EndMinutes)
{
    public bool Overlaps(int otherStartMinutes, int otherEndMinutes)
    {
        var overlapStart = Math.Max(StartMinutes, otherStartMinutes);
        var overlapEnd = Math.Min(EndMinutes, otherEndMinutes);
        return overlapEnd > overlapStart;
    }
}

public static class CustomerAvailabilityWindow
{
    private const int MorningStart = 8 * 60;
    private const int MorningEnd = 12 * 60;
    private const int AfternoonStart = 12 * 60;
    private const int AfternoonEnd = 17 * 60;
    private const int EveningStart = 17 * 60;
    private const int EveningEnd = 20 * 60;

    /// <summary>
    /// Returns null when the customer is flexible / any time on the scheduled day.
    /// </summary>
    public static CustomerTimeWindow? TryParse(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return null;

        var normalized = text.Trim().ToLowerInvariant();
        if (normalized is "any" or "any time" or "anytime" or "flexible" or "no preference")
            return null;

        var hasMorning = normalized.Contains("morning", StringComparison.Ordinal);
        var hasAfternoon = normalized.Contains("afternoon", StringComparison.Ordinal);
        var hasEvening = normalized.Contains("evening", StringComparison.Ordinal);

        if (hasMorning && hasAfternoon && hasEvening)
            return new CustomerTimeWindow(MorningStart, EveningEnd);
        if (hasMorning && hasAfternoon)
            return new CustomerTimeWindow(MorningStart, AfternoonEnd);
        if (hasMorning && hasEvening)
            return new CustomerTimeWindow(MorningStart, EveningEnd);
        if (hasAfternoon && hasEvening)
            return new CustomerTimeWindow(AfternoonStart, EveningEnd);
        if (hasMorning)
            return new CustomerTimeWindow(MorningStart, MorningEnd);
        if (hasAfternoon)
            return new CustomerTimeWindow(AfternoonStart, AfternoonEnd);
        if (hasEvening)
            return new CustomerTimeWindow(EveningStart, EveningEnd);

        // Weekday / weekend without a time band - day-level only.
        if (normalized.Contains("weekday", StringComparison.Ordinal)
            || normalized.Contains("week day", StringComparison.Ordinal)
            || normalized.Contains("weekend", StringComparison.Ordinal))
        {
            return null;
        }

        return null;
    }

    public static bool OverlapsProviderHours(
        string? customerAvailabilityText,
        int providerStartMinutes,
        int providerEndMinutes)
    {
        var customerWindow = TryParse(customerAvailabilityText);
        if (customerWindow is null)
            return providerEndMinutes > providerStartMinutes;

        return customerWindow.Value.Overlaps(providerStartMinutes, providerEndMinutes);
    }
}
