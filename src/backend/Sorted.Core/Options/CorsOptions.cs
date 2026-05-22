namespace Sorted.Core.Options;

public class CorsOptions
{
    public const string Section = "Cors";
    public string[] AllowedOrigins { get; set; } = ["http://localhost:3000"];
}
