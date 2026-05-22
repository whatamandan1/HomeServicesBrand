namespace Sorted.Core.Geo;

public static class PostcodeFormat
{
    public static string Outcode(string postcode)
    {
        var normalized = Normalize(postcode);
        if (string.IsNullOrWhiteSpace(normalized))
            return string.Empty;

        var space = normalized.IndexOf(' ');
        return space > 0 ? normalized[..space] : normalized;
    }

    public static string Normalize(string postcode)
    {
        var compact = postcode.Trim().ToUpperInvariant().Replace(" ", "", StringComparison.Ordinal);
        if (compact.Length < 5)
            return compact;

        return compact[..^3] + " " + compact[^3..];
    }
}
