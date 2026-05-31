using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class ProviderVettingRulesTests
{
    [Theory]
    [InlineData("ABC12DEF3", true)]
    [InlineData("abc12def3", true)]
    [InlineData("ABC12DE", false)]
    [InlineData("", false)]
    public void IsShareCodeValid_evaluates_length_and_chars(string code, bool expected)
    {
        Assert.Equal(expected, ProviderVettingRules.IsShareCodeValid(code));
    }

    [Fact]
    public void HasMinimumSubmission_requires_all_fields()
    {
        Assert.False(ProviderVettingRules.HasMinimumSubmission(
            new DateOnly(1990, 1, 1), null, "X", null, null, "DBS1", new DateOnly(2024, 6, 1), false));

        Assert.False(ProviderVettingRules.HasMinimumSubmission(
            new DateOnly(1990, 1, 1),
            "Passport",
            "123456",
            "ABC12DEF3",
            null,
            "DBS001",
            new DateOnly(2024, 6, 1),
            false));

        Assert.True(ProviderVettingRules.HasMinimumSubmission(
            new DateOnly(1990, 1, 1),
            "Passport",
            "123456",
            "ABC12DEF3",
            null,
            "DBS001",
            new DateOnly(2024, 6, 1),
            true));
    }
}
