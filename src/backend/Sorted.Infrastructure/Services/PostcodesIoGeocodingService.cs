using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;

namespace Sorted.Infrastructure.Services;

public class PostcodesIoGeocodingService(HttpClient http, ILogger<PostcodesIoGeocodingService> logger)
    : IPostcodeGeocodingService
{
    public Task<GeocodedPostcode?> LookupAsync(string postcode, CancellationToken ct = default) =>
        FetchPostcodeAsync($"postcodes/{Encode(postcode)}", ct);

    public Task<IReadOnlyList<GeocodedPostcode>> NearPointAsync(
        double latitude,
        double longitude,
        int radiusMeters,
        int limit,
        CancellationToken ct = default) =>
        FetchPostcodeListAsync(
            $"postcodes?lat={latitude:F6}&lon={longitude:F6}&radius={radiusMeters}&limit={limit}",
            ct);

    public Task<IReadOnlyList<GeocodedPostcode>> NearestPostcodesAsync(
        string postcode,
        int radiusMeters,
        int limit,
        CancellationToken ct = default) =>
        FetchPostcodeListAsync(
            $"postcodes/{Encode(postcode)}/nearest?radius={radiusMeters}&limit={limit}",
            ct);

    private async Task<GeocodedPostcode?> FetchPostcodeAsync(string path, CancellationToken ct)
    {
        try
        {
            using var response = await http.GetAsync($"https://api.postcodes.io/{path}", ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Postcode lookup failed for {Path}: {Status}", path, response.StatusCode);
                return null;
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            if (!doc.RootElement.TryGetProperty("result", out var result))
                return null;

            return ParsePostcode(result);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Postcode lookup error for {Path}", path);
            return null;
        }
    }

    private async Task<IReadOnlyList<GeocodedPostcode>> FetchPostcodeListAsync(string path, CancellationToken ct)
    {
        try
        {
            using var response = await http.GetAsync($"https://api.postcodes.io/{path}", ct);
            if (!response.IsSuccessStatusCode)
            {
                logger.LogWarning("Postcode list lookup failed for {Path}: {Status}", path, response.StatusCode);
                return [];
            }

            await using var stream = await response.Content.ReadAsStreamAsync(ct);
            using var doc = await JsonDocument.ParseAsync(stream, cancellationToken: ct);
            if (!doc.RootElement.TryGetProperty("result", out var result) || result.ValueKind != JsonValueKind.Array)
                return [];

            return result.EnumerateArray()
                .Select(ParsePostcode)
                .Where(p => p is not null)
                .Select(p => p!)
                .ToList();
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Postcode list lookup error for {Path}", path);
            return [];
        }
    }

    private static GeocodedPostcode? ParsePostcode(JsonElement result)
    {
        if (!result.TryGetProperty("latitude", out var latEl) ||
            !result.TryGetProperty("longitude", out var lonEl))
            return null;

        var lat = latEl.GetDouble();
        var lon = lonEl.GetDouble();
        var postcode = result.GetProperty("postcode").GetString();
        if (string.IsNullOrWhiteSpace(postcode))
            return null;

        return new GeocodedPostcode(postcode, lat, lon);
    }

    private static string Encode(string postcode) =>
        WebUtility.UrlEncode(postcode.Trim().ToUpperInvariant());
}
