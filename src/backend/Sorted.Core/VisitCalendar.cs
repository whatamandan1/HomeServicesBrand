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
}
