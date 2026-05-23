using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Sorted.Core.Entities;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class ProviderCoverageService(
    SortedDbContext db,
    IPostcodeGeocodingService geocoding,
    IServiceScopeFactory scopeFactory,
    ILogger<ProviderCoverageService> logger) : IProviderCoverageService
{
    private const double PartialOverlapBufferMiles = 1.0;
    private const int PostcodesIoMaxRadiusMeters = 2000;
    private const int PostcodesIoMaxLimit = 100;
    private const int MaxApiQueriesPerSync = 150;

    private static readonly ConcurrentDictionary<Guid, byte> SyncInProgress = new();

    public void ScheduleTerritorySync(Guid providerId) =>
        ScheduleTerritoryWork(providerId, skipWhenTerritoriesExist: true);

    public void ScheduleTerritoryResync(Guid providerId) =>
        ScheduleTerritoryWork(providerId, skipWhenTerritoriesExist: false);

    private void ScheduleTerritoryWork(Guid providerId, bool skipWhenTerritoriesExist)
    {
        if (!SyncInProgress.TryAdd(providerId, 0))
            return;

        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var scopedDb = scope.ServiceProvider.GetRequiredService<SortedDbContext>();
                var provider = await scopedDb.Providers
                    .Include(p => p.Territories)
                    .FirstOrDefaultAsync(p => p.Id == providerId && !p.IsDeleted);

                if (provider?.CoverageLatitude is null || provider.CoverageLongitude is null)
                    return;

                if (skipWhenTerritoriesExist && provider.Territories.Any(t => !t.IsDeleted))
                    return;

                var coverage = scope.ServiceProvider.GetRequiredService<IProviderCoverageService>();
                await coverage.SyncTerritoriesAsync(provider, CancellationToken.None);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Background territory sync failed for provider {ProviderId}", providerId);
            }
            finally
            {
                SyncInProgress.TryRemove(providerId, out _);
            }
        });
    }

    public async Task SyncTerritoriesAsync(Provider provider, CancellationToken ct = default)
    {
        if (provider.CoverageLatitude is not double lat || provider.CoverageLongitude is not double lon)
            return;

        var outcodes = await ResolveOutcodesAsync(lat, lon, provider.CoverageRadiusMiles, ct);
        if (outcodes.Count == 0)
        {
            logger.LogWarning(
                "No outcodes resolved for provider {ProviderId} at {Lat},{Lon} radius {Radius}",
                provider.Id,
                lat,
                lon,
                provider.CoverageRadiusMiles);
            return;
        }

        var existing = await db.ProviderTerritories
            .Where(t => t.ProviderId == provider.Id && !t.IsDeleted)
            .ToListAsync(ct);

        foreach (var territory in existing)
            db.ProviderTerritories.Remove(territory);

        foreach (var outcode in outcodes)
        {
            db.ProviderTerritories.Add(new ProviderTerritory
            {
                ProviderId = provider.Id,
                PostcodeSector = outcode
            });
        }

        await db.SaveChangesAsync(ct);
        provider.Territories = outcodes
            .Select(o => new ProviderTerritory { ProviderId = provider.Id, PostcodeSector = o })
            .ToList();

        logger.LogInformation(
            "Synced {Count} postcode outcodes for provider {ProviderId} ({Radius} miles from base)",
            outcodes.Count,
            provider.Id,
            provider.CoverageRadiusMiles);
    }

    public async Task<bool> IsPropertyWithinCoverageAsync(
        Provider provider,
        CustomerProperty property,
        CancellationToken ct = default)
    {
        await LoadTerritoriesAsync(provider, ct);

        var propertyOutcode = PostcodeFormat.Outcode(property.Postcode);
        if (provider.Territories.Count > 0)
        {
            if (provider.Territories.Any(t =>
                    string.Equals(t.PostcodeSector, propertyOutcode, StringComparison.OrdinalIgnoreCase)))
                return true;
        }
        else if (provider.CoverageLatitude is not null)
        {
            ScheduleTerritorySync(provider.Id);
        }

        if (provider.CoverageLatitude is not double pLat || provider.CoverageLongitude is not double pLon)
            return false;

        var coords = await GetPropertyCoordinatesAsync(property, ct);
        if (coords is null)
            return false;

        var effectiveRadius = provider.CoverageRadiusMiles + PartialOverlapBufferMiles;
        return GeoDistance.MilesBetween(pLat, pLon, coords.Latitude, coords.Longitude) <= effectiveRadius;
    }

    private async Task LoadTerritoriesAsync(Provider provider, CancellationToken ct)
    {
        if (provider.Territories.Count > 0)
            return;

        provider.Territories = await db.ProviderTerritories
            .Where(t => t.ProviderId == provider.Id && !t.IsDeleted)
            .ToListAsync(ct);
    }

    private async Task<IReadOnlyList<string>> ResolveOutcodesAsync(
        double latitude,
        double longitude,
        double radiusMiles,
        CancellationToken ct)
    {
        var effectiveRadius = radiusMiles + PartialOverlapBufferMiles;
        var outcodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var seenPostcodes = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var queue = new Queue<GeocodedPostcode>();
        var queries = 0;

        foreach (var seed in await geocoding.NearPointAsync(
                     latitude,
                     longitude,
                     PostcodesIoMaxRadiusMeters,
                     PostcodesIoMaxLimit,
                     ct))
            queue.Enqueue(seed);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            if (!seenPostcodes.Add(current.Postcode))
                continue;

            var distance = GeoDistance.MilesBetween(latitude, longitude, current.Latitude, current.Longitude);
            if (distance > effectiveRadius)
                continue;

            outcodes.Add(PostcodeFormat.Outcode(current.Postcode));

            if (queries >= MaxApiQueriesPerSync)
                continue;

            queries++;
            foreach (var neighbour in await geocoding.NearestPostcodesAsync(
                         current.Postcode,
                         PostcodesIoMaxRadiusMeters,
                         PostcodesIoMaxLimit,
                         ct))
            {
                if (!seenPostcodes.Contains(neighbour.Postcode))
                    queue.Enqueue(neighbour);
            }
        }

        if (queries >= MaxApiQueriesPerSync && radiusMiles > 2)
            await SupplementWithRingSamplingAsync(latitude, longitude, effectiveRadius, outcodes, seenPostcodes, ct);

        return outcodes.OrderBy(o => o, StringComparer.OrdinalIgnoreCase).ToList();
    }

    private async Task SupplementWithRingSamplingAsync(
        double latitude,
        double longitude,
        double effectiveRadius,
        HashSet<string> outcodes,
        HashSet<string> seenPostcodes,
        CancellationToken ct)
    {
        foreach (var (sampleLat, sampleLon) in SampleCirclePoints(latitude, longitude, effectiveRadius))
        {
            foreach (var postcode in await geocoding.NearPointAsync(
                         sampleLat,
                         sampleLon,
                         PostcodesIoMaxRadiusMeters,
                         PostcodesIoMaxLimit,
                         ct))
            {
                if (!seenPostcodes.Add(postcode.Postcode))
                    continue;

                var distance = GeoDistance.MilesBetween(latitude, longitude, postcode.Latitude, postcode.Longitude);
                if (distance <= effectiveRadius)
                    outcodes.Add(PostcodeFormat.Outcode(postcode.Postcode));
            }
        }
    }

    private static IEnumerable<(double Lat, double Lon)> SampleCirclePoints(
        double centerLat,
        double centerLon,
        double radiusMiles)
    {
        const int directions = 16;
        var lonScale = 69.0 * Math.Cos(centerLat * Math.PI / 180.0);

        foreach (var fraction in new[] { 0.35, 0.65, 1.0 })
        {
            var dist = radiusMiles * fraction;
            for (var i = 0; i < directions; i++)
            {
                var angle = 2 * Math.PI * i / directions;
                var dLat = dist / 69.0 * Math.Cos(angle);
                var dLon = dist / lonScale * Math.Sin(angle);
                yield return (centerLat + dLat, centerLon + dLon);
            }
        }
    }

    private async Task<GeocodedPostcode?> GetPropertyCoordinatesAsync(CustomerProperty property, CancellationToken ct)
    {
        if (property.Latitude is double lat && property.Longitude is double lon)
            return new GeocodedPostcode(property.Postcode, lat, lon);

        var geo = await geocoding.LookupAsync(property.Postcode, ct);
        if (geo is null)
            return null;

        property.Latitude = geo.Latitude;
        property.Longitude = geo.Longitude;
        await db.SaveChangesAsync(ct);
        return geo;
    }
}
