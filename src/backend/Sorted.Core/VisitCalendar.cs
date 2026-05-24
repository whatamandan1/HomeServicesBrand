namespace Sorted.Core;

public static class VisitCalendar
{
    /// <summary>
    /// Visits are scheduled on calendar days stored as UTC midnight.
    /// </summary>
    public static DateOnly ToVisitDate(DateTime scheduledDate)
    {
        var utc = scheduledDate.Kind switch
        {
            DateTimeKind.Utc => scheduledDate,
            DateTimeKind.Local => scheduledDate.ToUniversalTime(),
            _ => DateTime.SpecifyKind(scheduledDate, DateTimeKind.Utc),
        };
        return DateOnly.FromDateTime(utc.Date);
    }

    public static (DateTime StartUtc, DateTime EndUtc) ToUtcDayRange(DateOnly date)
    {
        var start = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        return (start, start.AddDays(1));
    }

    /// <summary>
    /// Returns true when an assigned visit should be returned to the open pool
    /// because it falls on a non-working day, blocked date, or outside working hours / customer window.
    /// </summary>
    public static bool ConflictsWithAvailability(
        DateTime scheduledDate,
        int workingDaysMask,
        IEnumerable<DateOnly> blockedDates,
        int providerStartMinutes,
        int providerEndMinutes,
        string? customerAvailabilityWindow)
    {
        var visitDate = ToVisitDate(scheduledDate);
        if (!ProviderWorkingDays.IsWorkingDay(workingDaysMask, visitDate.DayOfWeek))
            return true;

        if (blockedDates.Contains(visitDate))
            return true;

        return !CustomerAvailabilityWindow.OverlapsProviderHours(
            customerAvailabilityWindow,
            providerStartMinutes,
            providerEndMinutes);
    }
}
