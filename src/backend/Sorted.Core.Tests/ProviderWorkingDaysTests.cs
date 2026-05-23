using Sorted.Core;

namespace Sorted.Core.Tests;

public class ProviderWorkingDaysTests
{
    [Fact]
    public void DefaultWeekdays_includes_monday_to_friday_only()
    {
        Assert.True(ProviderWorkingDays.IsWorkingDay(ProviderWorkingDays.DefaultWeekdays, DayOfWeek.Monday));
        Assert.True(ProviderWorkingDays.IsWorkingDay(ProviderWorkingDays.DefaultWeekdays, DayOfWeek.Friday));
        Assert.False(ProviderWorkingDays.IsWorkingDay(ProviderWorkingDays.DefaultWeekdays, DayOfWeek.Saturday));
        Assert.False(ProviderWorkingDays.IsWorkingDay(ProviderWorkingDays.DefaultWeekdays, DayOfWeek.Sunday));
    }

    [Fact]
    public void MaskFromDays_round_trips()
    {
        var mask = ProviderWorkingDays.MaskFromDays(
            [DayOfWeek.Tuesday, DayOfWeek.Thursday, DayOfWeek.Saturday]);
        Assert.Equal(ProviderWorkingDays.Tuesday | ProviderWorkingDays.Thursday | ProviderWorkingDays.Saturday, mask);
        Assert.Equal(3, ProviderWorkingDays.DaysFromMask(mask).Count);
    }

    [Fact]
    public void WorkHours_parse_and_format()
    {
        Assert.Equal(480, ProviderWorkHours.ParseMinutes("08:00"));
        Assert.Equal("16:00", ProviderWorkHours.FormatMinutes(16 * 60));
    }
}
