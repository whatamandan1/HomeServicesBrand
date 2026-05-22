namespace Sorted.Infrastructure.Services;

public static class UkPhoneNumber
{
    public static string? ToE164(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return null;

        var digits = new string(phone.Where(char.IsDigit).ToArray());
        if (digits.Length == 0)
            return null;

        if (digits.StartsWith("44", StringComparison.Ordinal))
            return "+" + digits;

        if (digits.StartsWith('0') && digits.Length >= 10)
            return "+44" + digits[1..];

        return phone.TrimStart().StartsWith('+') ? phone.Trim() : "+" + digits;
    }
}
