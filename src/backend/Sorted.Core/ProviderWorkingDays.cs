namespace Sorted.Core;

public static class ProviderWorkingDays
{
    public const int Monday = 1;
    public const int Tuesday = 2;
    public const int Wednesday = 4;
    public const int Thursday = 8;
    public const int Friday = 16;
    public const int Saturday = 32;
    public const int Sunday = 64;
    public const int DefaultWeekdays = Monday | Tuesday | Wednesday | Thursday | Friday;

    public static bool IsWorkingDay(int mask, DayOfWeek dayOfWeek)
    {
        var bit = dayOfWeek switch
        {
            DayOfWeek.Monday => Monday,
            DayOfWeek.Tuesday => Tuesday,
            DayOfWeek.Wednesday => Wednesday,
            DayOfWeek.Thursday => Thursday,
            DayOfWeek.Friday => Friday,
            DayOfWeek.Saturday => Saturday,
            DayOfWeek.Sunday => Sunday,
            _ => 0,
        };
        return (mask & bit) != 0;
    }

    public static int MaskFromDays(IEnumerable<DayOfWeek> days)
    {
        var mask = 0;
        foreach (var day in days)
        {
            mask |= day switch
            {
                DayOfWeek.Monday => Monday,
                DayOfWeek.Tuesday => Tuesday,
                DayOfWeek.Wednesday => Wednesday,
                DayOfWeek.Thursday => Thursday,
                DayOfWeek.Friday => Friday,
                DayOfWeek.Saturday => Saturday,
                DayOfWeek.Sunday => Sunday,
                _ => 0,
            };
        }
        return mask;
    }

    public static IReadOnlyList<DayOfWeek> DaysFromMask(int mask)
    {
        var days = new List<DayOfWeek>(7);
        if ((mask & Monday) != 0) days.Add(DayOfWeek.Monday);
        if ((mask & Tuesday) != 0) days.Add(DayOfWeek.Tuesday);
        if ((mask & Wednesday) != 0) days.Add(DayOfWeek.Wednesday);
        if ((mask & Thursday) != 0) days.Add(DayOfWeek.Thursday);
        if ((mask & Friday) != 0) days.Add(DayOfWeek.Friday);
        if ((mask & Saturday) != 0) days.Add(DayOfWeek.Saturday);
        if ((mask & Sunday) != 0) days.Add(DayOfWeek.Sunday);
        return days;
    }
}

public static class ProviderWorkHours
{
    public const int DefaultStartMinutes = 8 * 60;
    public const int DefaultEndMinutes = 16 * 60;

    public static string FormatMinutes(int minutes)
    {
        var hours = minutes / 60;
        var mins = minutes % 60;
        return $"{hours:D2}:{mins:D2}";
    }

    public static int ParseMinutes(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            throw new FormatException("Time is required.");

        var parts = value.Trim().Split(':');
        if (parts.Length != 2
            || !int.TryParse(parts[0], out var hours)
            || !int.TryParse(parts[1], out var mins)
            || hours is < 0 or > 23
            || mins is < 0 or > 59)
        {
            throw new FormatException("Use 24-hour time like 08:00.");
        }

        return hours * 60 + mins;
    }
}
