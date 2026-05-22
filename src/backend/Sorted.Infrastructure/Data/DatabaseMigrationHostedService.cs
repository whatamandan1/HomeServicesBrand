using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Sorted.Core.Interfaces;

namespace Sorted.Infrastructure.Data;

public class DatabaseMigrationHostedService(
    IServiceProvider services,
    ILogger<DatabaseMigrationHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var scope = services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<SortedDbContext>();
            var configuration = scope.ServiceProvider.GetService<IConfiguration>();
            var scheduling = scope.ServiceProvider.GetRequiredService<IVisitSchedulingService>();
            var coverage = scope.ServiceProvider.GetRequiredService<IProviderCoverageService>();
            await DatabaseInitializer.InitializeAsync(db, logger, configuration, cancellationToken);
            await DataSeeder.EnsureDemoDispatchDataAsync(db, scheduling, logger, cancellationToken);

            var demoProvider = await db.Providers
                .Include(p => p.User)
                .Include(p => p.Territories)
                .FirstOrDefaultAsync(
                    p => p.User.Email == DataSeeder.ProviderEmail && !p.IsDeleted,
                    cancellationToken);
            if (demoProvider?.CoverageLatitude is not null && demoProvider.Territories.Count == 0)
                coverage.ScheduleTerritorySync(demoProvider.Id);
        }
        catch (Exception ex)
        {
            logger.LogCritical(ex, "Database initialization failed");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}

public static class DatabaseMigrationState
{
    private static volatile bool _ready;
    private static string? _error;

    public static bool IsReady => _ready;
    public static string? LastError => _error;

    public static void MarkReady() { _ready = true; _error = null; }
    public static void MarkFailed(string error) { _ready = false; _error = error; }
}
