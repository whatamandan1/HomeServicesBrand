using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;
using Sorted.Infrastructure.Services;

namespace Sorted.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddSortedInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.Section));
        services.Configure<StripeOptions>(configuration.GetSection(StripeOptions.Section));
        services.Configure<PlanPricingOptions>(configuration.GetSection(PlanPricingOptions.Section));
        services.Configure<SendGridOptions>(configuration.GetSection(SendGridOptions.Section));
        services.Configure<OpenAiOptions>(configuration.GetSection(OpenAiOptions.Section));
        services.Configure<TwilioOptions>(configuration.GetSection(TwilioOptions.Section));
        services.Configure<FeaturesOptions>(configuration.GetSection(FeaturesOptions.Section));
        services.Configure<AppOptions>(configuration.GetSection(AppOptions.Section));
        services.Configure<BackgroundJobsOptions>(configuration.GetSection(BackgroundJobsOptions.Section));

        var connectionString = DatabaseConfiguration.ResolveConnectionString(configuration);
        services.AddDbContext<SortedDbContext>(options =>
        {
            options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));

            if (DatabaseConfiguration.IsPostgres(connectionString))
                options.UseNpgsql(connectionString);
            else
                options.UseSqlite(connectionString);
        });

        services.AddScoped<JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IStripePaymentService, StripePaymentService>();
        services.AddScoped<IEmailService, SendGridEmailService>();
        services.AddScoped<ISmsService, TwilioSmsService>();
        services.AddScoped<IAiSupportService, OpenAiSupportService>();
        services.AddScoped<IVisitSchedulingService, VisitSchedulingService>();
        services.AddScoped<IVisitManagementService, VisitManagementService>();
        services.AddScoped<IProviderCoverageService, ProviderCoverageService>();
        services.AddHttpClient<IPostcodeGeocodingService, PostcodesIoGeocodingService>(client =>
        {
            client.Timeout = TimeSpan.FromSeconds(15);
            client.DefaultRequestHeaders.UserAgent.ParseAdd("GardensSorted/1.0");
        });
        services.AddScoped<IWorkflowLogger, WorkflowLogger>();

        services.AddHostedService<DatabaseMigrationHostedService>();
        services.AddHostedService<OperationalBackgroundService>();
        return services;
    }
}
