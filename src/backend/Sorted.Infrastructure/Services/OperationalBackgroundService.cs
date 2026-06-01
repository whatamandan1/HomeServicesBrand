using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class OperationalBackgroundService(
    IServiceProvider services,
    IOptions<BackgroundJobsOptions> options,
    ILogger<OperationalBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var opts = options.Value;
        if (!opts.Enabled)
        {
            logger.LogInformation("Operational background jobs are disabled");
            return;
        }

        while (!DatabaseMigrationState.IsReady && !stoppingToken.IsCancellationRequested)
        {
            if (DatabaseMigrationState.LastError is not null)
            {
                logger.LogWarning(
                    "Database initialization failed; background jobs will not run: {Error}",
                    DatabaseMigrationState.LastError);
                return;
            }

            await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
        }

        var interval = TimeSpan.FromMinutes(Math.Max(1, opts.IntervalMinutes));
        logger.LogInformation(
            "Operational background jobs started (every {IntervalMinutes} min, target {TargetVisits} future visits)",
            opts.IntervalMinutes,
            opts.TargetFutureVisits);

        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        using var timer = new PeriodicTimer(interval);
        do
        {
            try
            {
                await RunJobsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Operational background job run failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    internal async Task RunJobsAsync(CancellationToken ct)
    {
        using var scope = services.CreateScope();
        var scheduling = scope.ServiceProvider.GetRequiredService<IVisitSchedulingService>();
        var opts = options.Value;

        logger.LogDebug("Running operational background jobs");
        await scheduling.TopUpFutureVisitsAsync(opts.TargetFutureVisits, ct);
        await scheduling.OpenUpcomingVisitsForDispatchAsync(opts.DispatchOpenWithinDays, ct);
        await scheduling.ExpireStaleDispatchOffersAsync(opts.DispatchOfferExpiryDays, ct);
        await scheduling.SendDueVisitRemindersAsync(opts.ReminderLeadHours, ct);

        var scheduledComms = scope.ServiceProvider.GetRequiredService<IScheduledCommunicationService>();
        await scheduledComms.RunScheduledNotificationsAsync(ct);
    }
}
