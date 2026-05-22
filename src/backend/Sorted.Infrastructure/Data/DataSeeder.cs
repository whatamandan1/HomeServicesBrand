using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Data;

public static class DataSeeder
{
    public const string AdminEmail = "admin@gardenssorted.local";
    public const string AdminPassword = "Admin123!";
    public const string ProviderEmail = "provider@gardenssorted.local";
    public const string ProviderPassword = "Provider123!";

    public static async Task SeedAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (!await db.Brands.AnyAsync(ct))
        {
            await SeedInitialDataAsync(db, logger, ct);
            return;
        }

        await EnsureDemoUsersAsync(db, logger, ct);
    }

    private static async Task SeedInitialDataAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var brand = new Brand
        {
            Code = "gardens-sorted",
            Name = "GardensSorted",
            PrimaryDomain = "localhost:3000",
            ThemeJson = """{"primary":"#2d6a4f","accent":"#95d5b2"}"""
        };
        db.Brands.Add(brand);

        db.SubscriptionPlans.AddRange(
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Essential Monthly",
                Description = "Weekly garden maintenance, 3-month minimum.",
                BillingInterval = SubscriptionBillingInterval.Monthly,
                MinimumTermMonths = 3,
                PriceGbp = 29.95m
            },
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Essential Annual",
                Description = "Weekly garden maintenance, 12-month commitment, discounted.",
                BillingInterval = SubscriptionBillingInterval.Annual,
                MinimumTermMonths = 12,
                PriceGbp = 299.95m
            });

        await db.SaveChangesAsync(ct);
        await EnsureDemoUsersAsync(db, logger, ct);
        logger.LogInformation("Database seeded with GardensSorted brand, plans, admin and demo provider.");
    }

    private static async Task EnsureDemoUsersAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var brandId = await db.Brands.Where(b => b.Code == "gardens-sorted").Select(b => b.Id).FirstOrDefaultAsync(ct);

        if (!await db.Users.AnyAsync(u => u.Email == AdminEmail, ct))
        {
            db.Users.Add(new UserAccount
            {
                Email = AdminEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(AdminPassword),
                FirstName = "Sorted",
                LastName = "Admin",
                Role = UserRole.Admin,
                BrandId = brandId == Guid.Empty ? null : brandId
            });
            logger.LogInformation("Created demo admin user {Email}", AdminEmail);
        }

        if (!await db.Users.AnyAsync(u => u.Email == ProviderEmail, ct))
        {
            var providerUser = new UserAccount
            {
                Email = ProviderEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(ProviderPassword),
                FirstName = "Alex",
                LastName = "Gardener",
                Phone = "07700900001",
                Role = UserRole.Provider
            };
            db.Users.Add(providerUser);
            await db.SaveChangesAsync(ct);

            var provider = new Provider
            {
                UserId = providerUser.Id,
                IsApproved = true,
                Bio = "Experienced gardener covering Leeds and Wakefield."
            };
            db.Providers.Add(provider);
            await db.SaveChangesAsync(ct);

            db.ProviderTerritories.AddRange(
                new ProviderTerritory { ProviderId = provider.Id, PostcodeSector = "LS1" },
                new ProviderTerritory { ProviderId = provider.Id, PostcodeSector = "LS2" },
                new ProviderTerritory { ProviderId = provider.Id, PostcodeSector = "WF1" });
            logger.LogInformation("Created demo provider user {Email}", ProviderEmail);
        }

        await db.SaveChangesAsync(ct);
    }

    public static async Task ApplyStripePriceIdsAsync(
        SortedDbContext db,
        IConfiguration configuration,
        ILogger logger,
        CancellationToken ct = default)
    {
        var stripe = configuration.GetSection(StripeOptions.Section).Get<StripeOptions>();
        if (stripe?.Prices is null)
            return;

        var monthly = stripe.Prices.EssentialMonthly?.Trim();
        var annual = stripe.Prices.EssentialAnnual?.Trim();
        if (string.IsNullOrEmpty(monthly) && string.IsNullOrEmpty(annual))
            return;

        var plans = await db.SubscriptionPlans.Where(p => !p.IsDeleted).ToListAsync(ct);
        var updated = false;

        foreach (var plan in plans)
        {
            if (plan.BillingInterval == SubscriptionBillingInterval.Monthly && !string.IsNullOrEmpty(monthly))
            {
                plan.StripePriceId = monthly;
                updated = true;
            }
            else if (plan.BillingInterval == SubscriptionBillingInterval.Annual && !string.IsNullOrEmpty(annual))
            {
                plan.StripePriceId = annual;
                updated = true;
            }
        }

        if (updated)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Applied Stripe Price IDs from configuration to subscription plans");
        }
    }

    public static async Task EnsurePlanPricingAsync(
        SortedDbContext db,
        ILogger logger,
        IConfiguration? configuration = null,
        CancellationToken ct = default)
    {
        var pricing = configuration?.GetSection(PlanPricingOptions.Section).Get<PlanPricingOptions>() ?? new PlanPricingOptions();
        var plans = await db.SubscriptionPlans.Where(p => !p.IsDeleted).ToListAsync(ct);
        var updated = false;

        foreach (var plan in plans)
        {
            var target = plan.BillingInterval switch
            {
                SubscriptionBillingInterval.Monthly => pricing.EssentialMonthly,
                SubscriptionBillingInterval.Annual => pricing.EssentialAnnual,
                _ => (decimal?)null
            };

            if (target is null || plan.PriceGbp == target)
                continue;

            plan.PriceGbp = target.Value;
            updated = true;
        }

        if (updated)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation(
                "Updated subscription plan prices to £{Monthly}/month and £{Annual}/year",
                pricing.EssentialMonthly,
                pricing.EssentialAnnual);
        }
    }
}
