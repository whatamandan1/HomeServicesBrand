using System.Text.Json;
using System.Text.Json.Serialization;
using Sorted.Core.Enums;

namespace Sorted.Core.Enums;

/// <summary>Maps legacy <c>XLarge</c> / <c>XXLarge</c> values to <see cref="GardenSize.Large"/>.</summary>
public sealed class GardenSizeJsonConverter : JsonConverter<GardenSize>
{
    public override GardenSize Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number && reader.TryGetInt32(out var numeric))
        {
            return numeric switch
            {
                >= 3 => GardenSize.Large,
                2 => GardenSize.Medium,
                _ => GardenSize.Small
            };
        }

        if (reader.TokenType != JsonTokenType.String)
            throw new JsonException("Expected string or number for GardenSize.");

        var value = reader.GetString();
        if (string.Equals(value, "XXLarge", StringComparison.OrdinalIgnoreCase)
            || string.Equals(value, "XLarge", StringComparison.OrdinalIgnoreCase))
            return GardenSize.Large;

        if (Enum.TryParse<GardenSize>(value, ignoreCase: true, out var parsed))
            return parsed;

        throw new JsonException($"Unknown garden size: {value}");
    }

    public override void Write(Utf8JsonWriter writer, GardenSize value, JsonSerializerOptions options) =>
        writer.WriteStringValue(value.ToString());
}
