using Microsoft.EntityFrameworkCore;
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
        services.Configure<SendGridOptions>(configuration.GetSection(SendGridOptions.Section));
        services.Configure<OpenAiOptions>(configuration.GetSection(OpenAiOptions.Section));

        var connectionString = DatabaseConfiguration.ResolveConnectionString(configuration);
        services.AddDbContext<SortedDbContext>(options =>
        {
            if (DatabaseConfiguration.IsPostgres(connectionString))
                options.UseNpgsql(connectionString);
            else
                options.UseSqlite(connectionString);
        });

        services.AddScoped<JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IStripePaymentService, StripePaymentService>();
        services.AddScoped<IEmailService, SendGridEmailService>();
        services.AddScoped<IAiSupportService, OpenAiSupportService>();
        services.AddScoped<IVisitSchedulingService, VisitSchedulingService>();
        services.AddScoped<IWorkflowLogger, WorkflowLogger>();

        return services;
    }
}
