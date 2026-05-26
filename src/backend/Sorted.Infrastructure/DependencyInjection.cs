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
        services.AddOptions<StripeOptions>()
            .Bind(configuration.GetSection(StripeOptions.Section))
            .PostConfigure(ProductionUrlConfiguration.ApplyStripeUrls);
        services.Configure<PlanPricingOptions>(configuration.GetSection(PlanPricingOptions.Section));
        services.Configure<SendGridOptions>(configuration.GetSection(SendGridOptions.Section));
        services.Configure<OpenAiOptions>(configuration.GetSection(OpenAiOptions.Section));
        services.Configure<TwilioOptions>(configuration.GetSection(TwilioOptions.Section));
        services.Configure<FeaturesOptions>(configuration.GetSection(FeaturesOptions.Section));
        services.AddOptions<AppOptions>()
            .Bind(configuration.GetSection(AppOptions.Section))
            .PostConfigure(options => ProductionUrlConfiguration.ApplyAppUrls(options, configuration));
        services.Configure<BackgroundJobsOptions>(configuration.GetSection(BackgroundJobsOptions.Section));
        services.Configure<ProviderPayoutOptions>(configuration.GetSection(ProviderPayoutOptions.Section));

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
        services.AddScoped<IProviderAvailabilityService, ProviderAvailabilityService>();
        services.AddScoped<IProviderEarningsService, ProviderEarningsService>();
        services.AddScoped<IPortfolioEnquiryService, PortfolioEnquiryService>();
        services.AddScoped<ISignupLeadService, SignupLeadService>();
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

internal static class ProductionUrlConfiguration
{
    public static void ApplyAppUrls(AppOptions options, IConfiguration configuration)
    {
        if (!UsesLocalhost(options.FrontendBaseUrl)) return;

        var successUrl = configuration[$"{StripeOptions.Section}:SuccessUrl"];
        if (Uri.TryCreate(successUrl, UriKind.Absolute, out var uri))
            options.FrontendBaseUrl = uri.GetLeftPart(UriPartial.Authority);
    }

    public static void ApplyStripeUrls(StripeOptions options)
    {
        if (!UsesLocalhost(options.BillingPortalReturnUrl)) return;
        if (!Uri.TryCreate(options.SuccessUrl, UriKind.Absolute, out var uri)) return;

        options.BillingPortalReturnUrl = $"{uri.GetLeftPart(UriPartial.Authority).TrimEnd('/')}/portal";
    }

    private static bool UsesLocalhost(string? url) =>
        string.IsNullOrWhiteSpace(url)
        || url.Contains("localhost", StringComparison.OrdinalIgnoreCase);
}
