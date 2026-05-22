namespace Sorted.Core.Geo;

public static class PostcodeFormat
{
    public static string Outcode(string postcode)
    {
        var trimmed = postcode.Trim().ToUpperInvariant();
        if (string.IsNullOrWhiteSpace(trimmed))
            return string.Empty;

        var space = trimmed.IndexOf(' ');
        if (space > 0)
            return trimmed[..space];

        return trimmed.Length > 3 ? trimmed[..^3] : trimmed;
    }
}
