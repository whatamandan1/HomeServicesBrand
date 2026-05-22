using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Sorted.Core.Entities;
using Sorted.Core.Enums;

namespace Sorted.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
    {
        if (await db.Brands.AnyAsync(ct))
            return;

        var brand = new Brand
        {
            Code = "gardens-sorted",
            Name = "GardensSorted",
            PrimaryDomain = "localhost:3000",
            ThemeJson = """{"primary":"#2d6a4f","accent":"#95d5b2"}"""
        };
        db.Brands.Add(brand);

        var monthly = new SubscriptionPlan
        {
            BrandId = brand.Id,
            Name = "Essential Monthly",
            Description = "Weekly garden maintenance, 3-month minimum.",
            BillingInterval = SubscriptionBillingInterval.Monthly,
            MinimumTermMonths = 3,
            PriceGbp = 49m
        };
        var annual = new SubscriptionPlan
        {
            BrandId = brand.Id,
            Name = "Essential Annual",
            Description = "Weekly garden maintenance, 12-month commitment, discounted.",
            BillingInterval = SubscriptionBillingInterval.Annual,
            MinimumTermMonths = 12,
            PriceGbp = 499m
        };
        db.SubscriptionPlans.AddRange(monthly, annual);

        var admin = new UserAccount
        {
            Email = "admin@gardenssorted.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            FirstName = "Sorted",
            LastName = "Admin",
            Role = UserRole.Admin,
            BrandId = brand.Id
        };
        db.Users.Add(admin);

        var providerUser = new UserAccount
        {
            Email = "provider@gardenssorted.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Provider123!"),
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
            new ProviderTerritory { ProviderId = provider.Id, PostcodeSector = "WF1" }
        );

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Database seeded with GardensSorted brand, plans, admin and demo provider.");
    }
}
