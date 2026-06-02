using System.ClientModel;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using Sorted.Core.Dtos;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Core.Plans;

namespace Sorted.Infrastructure.Services;

public class GardenSizeSuggestionService(
    IHttpClientFactory httpClientFactory,
    IPostcodeGeocodingService geocoding,
    IOptions<OpenAiOptions> openAiOptions,
    IOptions<GoogleMapsOptions> googleMapsOptions,
    ILogger<GardenSizeSuggestionService> logger) : IGardenSizeSuggestionService
{
    private const string Disclaimer =
        "This is an estimate from satellite imagery — maintained lawn and beds only, not your whole plot. " +
        "We'll confirm your garden band on the first visit. You can change the size below before paying.";

    public async Task<GardenSizeSuggestionResponse?> SuggestAsync(
        GardenSizeSuggestRequest request,
        CancellationToken ct = default)
    {
        var mapsKey = googleMapsOptions.Value.ApiKey?.Trim();
        var openAiKey = openAiOptions.Value.ApiKey?.Trim();
        if (string.IsNullOrEmpty(mapsKey) || string.IsNullOrEmpty(openAiKey))
        {
            logger.LogDebug("Garden size suggestion skipped — Google Maps or OpenAI not configured.");
            return null;
        }

        var lat = request.Latitude;
        var lon = request.Longitude;
        if (lat is null || lon is null)
        {
            var geo = await geocoding.LookupAsync(request.Postcode, ct);
            if (geo is null)
                return null;
            lat = geo.Latitude;
            lon = geo.Longitude;
        }

        var imageBytes = await FetchSatelliteImageAsync(mapsKey, lat.Value, lon.Value, ct);
        if (imageBytes is null || imageBytes.Length == 0)
            return null;

        var estimate = await AnalyzeImageAsync(openAiKey, openAiOptions.Value.Model, imageBytes, request, ct);
        if (estimate is null)
            return null;

        var sqm = Math.Max(1, estimate.Value.Sqm);
        var requiresQuote = sqm > GardenSizePricing.MaxMaintainedAreaSqm(GardenSize.Large);
        var band = GardenSizePricing.BandFromEstimatedMaintainedSqm(sqm);

        return new GardenSizeSuggestionResponse(
            band,
            sqm,
            Math.Clamp(estimate.Value.Confidence, 0, 1),
            "aerial-ai",
            Disclaimer,
            requiresQuote);
    }

    private async Task<byte[]?> FetchSatelliteImageAsync(
        string apiKey,
        double latitude,
        double longitude,
        CancellationToken ct)
    {
        try
        {
            var url =
                $"https://maps.googleapis.com/maps/api/staticmap" +
                $"?center={latitude:F6},{longitude:F6}&zoom=19&size=512x512&maptype=satellite&key={Uri.EscapeDataString(apiKey)}";

            var client = httpClientFactory.CreateClient();
            var bytes = await client.GetByteArrayAsync(url, ct);
            return bytes.Length > 1000 ? bytes : null;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to fetch satellite image for garden size suggestion");
            return null;
        }
    }

    private async Task<(int Sqm, double Confidence)?> AnalyzeImageAsync(
        string apiKey,
        string model,
        byte[] imageBytes,
        GardenSizeSuggestRequest request,
        CancellationToken ct)
    {
        try
        {
            var client = new ChatClient(model, apiKey);
            var addressHint = string.IsNullOrWhiteSpace(request.Line1)
                ? request.Postcode
                : $"{request.Line1}, {request.Postcode}";

            var messages = new List<ChatMessage>
            {
                new SystemChatMessage(
                    "You estimate MAINTAINED garden area in square metres for UK suburban properties from satellite imagery. " +
                    "Maintained area = lawn, planted beds, and edges we would mow/weed — NOT whole plot, large patios, driveways, or neighbour gardens. " +
                    "Reply with ONLY compact JSON: {\"estimatedMaintainedSqm\":number,\"confidence\":number} where confidence is 0-1."),
                new UserChatMessage(
                    ChatMessageContentPart.CreateTextPart(
                        $"Estimate maintained garden m² for: {addressHint}. Bands: ≤50 Small, ≤100 Medium, ≤150 Large."),
                    ChatMessageContentPart.CreateImagePart(
                        BinaryData.FromBytes(imageBytes),
                        "image/jpeg",
                        ChatImageDetailLevel.Low))
            };

            var completion = await client.CompleteChatAsync(messages, cancellationToken: ct);
            var text = completion.Value.Content.FirstOrDefault()?.Text;
            if (string.IsNullOrWhiteSpace(text))
                return null;

            using var doc = JsonDocument.Parse(ExtractJson(text));
            var root = doc.RootElement;
            if (!root.TryGetProperty("estimatedMaintainedSqm", out var sqmEl))
                return null;

            var sqm = (int)Math.Round(sqmEl.GetDouble());
            var confidence = root.TryGetProperty("confidence", out var confEl) ? confEl.GetDouble() : 0.5;
            return (sqm, confidence);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "OpenAI garden size analysis failed");
            return null;
        }
    }

    private static string ExtractJson(string text)
    {
        var start = text.IndexOf('{');
        var end = text.LastIndexOf('}');
        if (start >= 0 && end > start)
            return text[start..(end + 1)];
        return text;
    }
}
