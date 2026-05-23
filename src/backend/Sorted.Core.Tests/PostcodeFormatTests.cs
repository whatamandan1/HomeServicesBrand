using Sorted.Core.Geo;

namespace Sorted.Core.Tests;

public class PostcodeFormatTests
{
    [Theory]
    [InlineData("ls1 4ab", "LS1 4AB")]
    [InlineData("WF1 2AB", "WF1 2AB")]
    public void Normalize_formats_uk_postcodes(string input, string expected)
    {
        Assert.Equal(expected, PostcodeFormat.Normalize(input));
    }

    [Theory]
    [InlineData("LS1 4AB", "LS1")]
    [InlineData("wf10 5nz", "WF10")]
    public void Outcode_returns_outward_code(string input, string expected)
    {
        Assert.Equal(expected, PostcodeFormat.Outcode(input));
    }
}
