using Sorted.Core;

namespace Sorted.Core.Tests;

public class CustomerAvailabilityWindowTests
{
    [Theory]
    [InlineData("Weekday mornings", 8 * 60, 12 * 60)]
    [InlineData("Afternoon only", 12 * 60, 17 * 60)]
    [InlineData("Evening visits", 17 * 60, 20 * 60)]
    public void TryParse_recognises_common_phrases(string text, int start, int end)
    {
        var window = CustomerAvailabilityWindow.TryParse(text);
        Assert.NotNull(window);
        Assert.Equal(start, window.Value.StartMinutes);
        Assert.Equal(end, window.Value.EndMinutes);
    }

    [Theory]
    [InlineData("Weekdays")]
    [InlineData("Any time")]
    [InlineData("")]
    public void TryParse_treats_flexible_preferences_as_any_time(string text)
    {
        Assert.Null(CustomerAvailabilityWindow.TryParse(text));
    }

    [Fact]
    public void OverlapsProviderHours_morning_customer_fits_standard_day()
    {
        Assert.True(CustomerAvailabilityWindow.OverlapsProviderHours(
            "Weekday mornings",
            providerStartMinutes: 8 * 60,
            providerEndMinutes: 16 * 60));
    }

    [Fact]
    public void OverlapsProviderHours_evening_customer_excludes_early_finish()
    {
        Assert.False(CustomerAvailabilityWindow.OverlapsProviderHours(
            "Evening only",
            providerStartMinutes: 8 * 60,
            providerEndMinutes: 16 * 60));
    }
}
