using Sorted.Core;

namespace Sorted.Core.Tests;

public class VisitCalendarTests
{
    [Fact]
    public void ToVisitDate_uses_utc_calendar_day()
    {
        var visitDate = VisitCalendar.ToVisitDate(new DateTime(2026, 6, 15, 0, 0, 0, DateTimeKind.Utc));
        Assert.Equal(new DateOnly(2026, 6, 15), visitDate);
    }

    [Fact]
    public void ToUtcDayRange_covers_single_day()
    {
        var (start, end) = VisitCalendar.ToUtcDayRange(new DateOnly(2026, 6, 15));
        Assert.Equal(new DateTime(2026, 6, 15, 0, 0, 0, DateTimeKind.Utc), start);
        Assert.Equal(new DateTime(2026, 6, 16, 0, 0, 0, DateTimeKind.Utc), end);
    }
}
