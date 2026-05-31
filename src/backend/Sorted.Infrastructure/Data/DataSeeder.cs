using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Services;

namespace Sorted.Infrastructure.Data;

public static class DataSeeder
{
    public const string AdminEmail = "admin@gardenssorted.local";
    public const string AdminPassword = "Admin123!";
    public const string ProviderEmail = "provider@gardenssorted.local";
    public const string ProviderPassword = "Provider123!";
    public const string DemoCustomerEmail = "demo@gardenssorted.local";
    public const string DemoCustomerPassword = "Demo123!";
    public const string DemoLandlordEmail = "landlord@gardenssorted.local";
    public const string DemoLandlordPassword = "Landlord123!";
    private const string DemoCoveragePostcode = "LS1 4AP";
    private const double DemoCoverageLatitude = 53.7991;
    private const double DemoCoverageLongitude = -1.5478;
    private const double DemoCoverageRadiusMiles = 15;
    private const double DemoPropertyLatitude = 53.7991;
    private const double DemoPropertyLongitude = -1.5478;

    public static async Task SeedAsync(SortedDbContext db, ILogger logger, bool seedDemoData, CancellationToken ct = default)
    {
        if (!await db.Brands.AnyAsync(ct))
        {
            await SeedInitialDataAsync(db, logger, seedDemoData, ct);
            return;
        }

        if (seedDemoData)
            await EnsureDemoUsersAsync(db, logger, ct);

        await EnsurePremiumPlansAsync(db, logger, ct);
        await EnsureElitePlansAsync(db, logger, ct);
    }

    /// <summary>
    /// Ensures demo provider territories, opens stuck scheduled visits, and seeds claimable demo jobs.
    /// </summary>
    public static async Task EnsureDemoDispatchDataAsync(
        SortedDbContext db,
        IVisitSchedulingService scheduling,
        ILogger logger,
        CancellationToken ct = default)
    {
        await EnsureDemoProviderCoverageAsync(db, logger, ct);
        await scheduling.OpenVisitsForDispatchAsync(ct);
        await EnsureDemoOpenVisitsAsync(db, logger, ct);
    }

    private static async Task SeedInitialDataAsync(SortedDbContext db, ILogger logger, bool seedDemoData, CancellationToken ct)
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
                Description = "Up to 50 m² — mow, edge, weed borders, tidy. 10 visits/year. From £59.99/mo. 3-month minimum.",
                BillingInterval = SubscriptionBillingInterval.Monthly,
                MinimumTermMonths = 3,
                PriceGbp = 59.99m
            },
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Essential Annual",
                Description = "Up to 50 m² — 10 visits/year. Annual plan (~10 months price).",
                BillingInterval = SubscriptionBillingInterval.Annual,
                MinimumTermMonths = 12,
                PriceGbp = 599.90m
            },
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Premium Monthly",
                Description = "Legacy tier — not offered at signup.",
                BillingInterval = SubscriptionBillingInterval.Monthly,
                MinimumTermMonths = 3,
                PriceGbp = 84.99m,
                IsActive = false
            },
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Premium Annual",
                Description = "Legacy tier — not offered at signup.",
                BillingInterval = SubscriptionBillingInterval.Annual,
                MinimumTermMonths = 12,
                PriceGbp = 849.90m,
                IsActive = false
            },
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Elite Monthly",
                Description = "Legacy tier — not offered at signup.",
                BillingInterval = SubscriptionBillingInterval.Monthly,
                MinimumTermMonths = 3,
                PriceGbp = 119.99m,
                IsActive = false
            },
            new SubscriptionPlan
            {
                BrandId = brand.Id,
                Name = "Elite Annual",
                Description = "Legacy tier — not offered at signup.",
                BillingInterval = SubscriptionBillingInterval.Annual,
                MinimumTermMonths = 12,
                PriceGbp = 1199.90m,
                IsActive = false
            });

        await db.SaveChangesAsync(ct);
        if (seedDemoData)
        {
            await EnsureDemoUsersAsync(db, logger, ct);
            logger.LogInformation("Database seeded with GardensSorted brand, plans, admin and demo provider.");
        }
        else
        {
            logger.LogInformation("Database seeded with GardensSorted brand and plans (demo accounts disabled).");
        }
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
                Bio = "Experienced gardener covering Leeds and Wakefield.",
                CoveragePostcode = DemoCoveragePostcode,
                CoverageLatitude = DemoCoverageLatitude,
                CoverageLongitude = DemoCoverageLongitude,
                CoverageRadiusMiles = DemoCoverageRadiusMiles
            };
            db.Providers.Add(provider);
            await db.SaveChangesAsync(ct);

            logger.LogInformation("Created demo provider user {Email}", ProviderEmail);
        }

        await db.SaveChangesAsync(ct);
        await EnsureDemoProviderCoverageAsync(db, logger, ct);
        await EnsureDemoLandlordAccountAsync(db, logger, ct);
    }

    /// <summary>Recovery hook when full migration/seed fails but demo landlord login should still work.</summary>
    public static Task EnsureDemoLandlordAsync(SortedDbContext db, ILogger logger, CancellationToken ct = default)
        => EnsureDemoLandlordAccountAsync(db, logger, ct);

    private static async Task EnsureDemoLandlordAccountAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var brandId = await db.Brands.Where(b => b.Code == "gardens-sorted").Select(b => b.Id).FirstOrDefaultAsync(ct);
        if (brandId == Guid.Empty)
            return;

        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == DemoLandlordEmail && !u.IsDeleted, ct);
        if (user is null)
        {
            user = new UserAccount
            {
                Email = DemoLandlordEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoLandlordPassword),
                FirstName = "Pat",
                LastName = "Mitchell",
                Phone = "07700900002",
                Role = UserRole.Landlord,
                BrandId = brandId
            };
            db.Users.Add(user);
            await db.SaveChangesAsync(ct);
            logger.LogInformation("Created demo landlord user {Email}", DemoLandlordEmail);
        }
        else
        {
            var updated = false;
            if (user.Role != UserRole.Landlord)
            {
                user.Role = UserRole.Landlord;
                updated = true;
            }
            if (!user.IsActive)
            {
                user.IsActive = true;
                updated = true;
            }
            if (!BCrypt.Net.BCrypt.Verify(DemoLandlordPassword, user.PasswordHash))
            {
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoLandlordPassword);
                updated = true;
            }
            if (updated)
            {
                await db.SaveChangesAsync(ct);
                logger.LogInformation("Updated demo landlord user {Email}", DemoLandlordEmail);
            }
        }

        var existingAccount = await db.MultiPropertyAccounts
            .AnyAsync(a => a.UserId == user.Id && !a.IsDeleted, ct);
        if (existingAccount)
            return;

        var account = new MultiPropertyAccount
        {
            UserId = user.Id,
            BrandId = brandId,
            CompanyName = "Mitchell Lettings",
            IndicativeMonthlyGbp = 185.00m,
            AgreementNotes = "Indicative demo quote — subject to review before agreement."
        };
        db.MultiPropertyAccounts.Add(account);

        var nextMonth = DateTime.UtcNow.Date.AddDays(14);
        var demoProperties = new[]
        {
            ("12 Oak Avenue", (string?)null, "Leeds", "LS6 2AB", GardenSize.Medium, "10 visits per year", "Essential tidy", nextMonth),
            ("4 Chapel Row", "Flat 2", "Leeds", "LS1 3AA", GardenSize.Small, "10 visits per year", "Essential tidy", nextMonth.AddDays(7)),
            ("88 Valley View", (string?)null, "Wakefield", "WF1 2EQ", GardenSize.Large, "2 visits per month", "Premium maintenance", nextMonth.AddDays(3))
        };

        for (var i = 0; i < demoProperties.Length; i++)
        {
            var (line1, line2, city, postcode, size, frequency, level, nextVisit) = demoProperties[i];
            db.MultiPropertyAccountProperties.Add(new MultiPropertyAccountProperty
            {
                Account = account,
                SortOrder = i,
                Line1 = line1,
                Line2 = line2,
                City = city,
                Postcode = postcode,
                GardenSize = size,
                VisitFrequency = frequency,
                ServiceLevel = level,
                NextVisitDate = nextVisit
            });
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded demo multi-property account for {Email} with {Count} properties", DemoLandlordEmail, demoProperties.Length);
    }

    private static async Task EnsureDemoProviderCoverageAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var provider = await db.Providers
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.User.Email == ProviderEmail && !p.IsDeleted, ct);
        if (provider is null)
            return;

        if (provider.CoverageLatitude is not null && provider.CoverageLongitude is not null)
            return;

        provider.CoveragePostcode = DemoCoveragePostcode;
        provider.CoverageLatitude = DemoCoverageLatitude;
        provider.CoverageLongitude = DemoCoverageLongitude;
        provider.CoverageRadiusMiles = DemoCoverageRadiusMiles;
        await db.SaveChangesAsync(ct);
        logger.LogInformation(
            "Backfilled demo provider coverage: {Postcode}, {Radius} miles",
            DemoCoveragePostcode,
            DemoCoverageRadiusMiles);
    }

    private static async Task EnsureDemoOpenVisitsAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var openVisits = await db.JobVisits
            .Include(v => v.Property)
            .Where(v => v.Status == VisitStatus.OpenForClaim && !v.IsDeleted)
            .ToListAsync(ct);

        if (openVisits.Any(v =>
                string.Equals(v.Property.Postcode, DemoCoveragePostcode, StringComparison.OrdinalIgnoreCase)))
            return;

        var brand = await db.Brands.FirstOrDefaultAsync(b => b.Code == "gardens-sorted", ct);
        var plan = brand is null
            ? null
            : await db.SubscriptionPlans
                .Where(p => p.BrandId == brand.Id && p.BillingInterval == SubscriptionBillingInterval.Monthly && !p.IsDeleted)
                .OrderBy(p => p.CreatedAtUtc)
                .FirstOrDefaultAsync(ct);
        if (brand is null || plan is null)
            return;

        var subscription = await db.CustomerSubscriptions
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .Include(s => s.Customer).ThenInclude(c => c.Properties)
            .FirstOrDefaultAsync(s => s.Customer.User.Email == DemoCustomerEmail && !s.IsDeleted, ct);

        if (subscription is null)
        {
            var user = new UserAccount
            {
                Email = DemoCustomerEmail,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(DemoCustomerPassword),
                FirstName = "Demo",
                LastName = "Customer",
                Phone = "07700900099",
                Role = UserRole.Customer,
                BrandId = brand.Id
            };
            db.Users.Add(user);
            await db.SaveChangesAsync(ct);

            var customer = new Customer { UserId = user.Id, BrandId = brand.Id };
            db.Customers.Add(customer);
            await db.SaveChangesAsync(ct);

            var property = new CustomerProperty
            {
                CustomerId = customer.Id,
                Line1 = "1 Demo Street",
                City = "Leeds",
                Postcode = DemoCoveragePostcode,
                Latitude = DemoPropertyLatitude,
                Longitude = DemoPropertyLongitude,
                GardenSize = GardenSize.Medium,
                IsPrimary = true
            };
            db.CustomerProperties.Add(property);

            subscription = new CustomerSubscription
            {
                CustomerId = customer.Id,
                SubscriptionPlanId = plan.Id,
                Status = SubscriptionStatus.Active,
                StartedAtUtc = DateTime.UtcNow,
                EndsAtUtc = DateTime.UtcNow.AddMonths(plan.MinimumTermMonths),
                AvailabilityPreference = "Weekday mornings"
            };
            db.CustomerSubscriptions.Add(subscription);
            await db.SaveChangesAsync(ct);

            subscription.Customer = customer;
            subscription.Customer.User = user;
            subscription.Customer.Properties = [property];
            logger.LogInformation("Created demo customer {Email} for provider dispatch testing", DemoCustomerEmail);
        }
        else if (subscription.Status != SubscriptionStatus.Active)
        {
            subscription.Status = SubscriptionStatus.Active;
            subscription.StartedAtUtc ??= DateTime.UtcNow;
            await db.SaveChangesAsync(ct);
        }

        var demoProperty = subscription.Customer.Properties.FirstOrDefault(p => p.IsPrimary && !p.IsDeleted)
            ?? subscription.Customer.Properties.FirstOrDefault(p => !p.IsDeleted);
        if (demoProperty is null)
            return;

        var start = DateTime.UtcNow.Date.AddDays(7);
        for (var i = 0; i < 3; i++)
        {
            var visit = new JobVisit
            {
                CustomerSubscriptionId = subscription.Id,
                CustomerPropertyId = demoProperty.Id,
                ScheduledDate = start.AddDays(i * 7),
                AvailabilityWindow = subscription.AvailabilityPreference,
                Status = VisitStatus.OpenForClaim
            };
            db.JobVisits.Add(visit);
            await db.SaveChangesAsync(ct);

            db.DispatchOffers.Add(new DispatchOffer
            {
                JobVisitId = visit.Id,
                Status = DispatchOfferStatus.Open,
                ExpiresAtUtc = DateTime.UtcNow.AddDays(3)
            });
        }

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Seeded {Count} open demo visits in {Postcode} for provider testing", 3, demoProperty.Postcode);
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

        var rawMonthly = stripe.Prices.EssentialMonthly?.Trim();
        var rawAnnual = stripe.Prices.EssentialAnnual?.Trim();
        var rawPremiumMonthly = stripe.Prices.PremiumMonthly?.Trim();
        var rawPremiumAnnual = stripe.Prices.PremiumAnnual?.Trim();
        var rawEliteMonthly = stripe.Prices.EliteMonthly?.Trim();
        var rawEliteAnnual = stripe.Prices.EliteAnnual?.Trim();
        var configuredPrices = new Dictionary<string, string?>(StringComparer.OrdinalIgnoreCase)
        {
            ["Essential Monthly"] = NormalizeStripePriceId(rawMonthly, logger, "EssentialMonthly"),
            ["Essential Annual"] = NormalizeStripePriceId(rawAnnual, logger, "EssentialAnnual"),
            ["Premium Monthly"] = NormalizeStripePriceId(rawPremiumMonthly, logger, "PremiumMonthly"),
            ["Premium Annual"] = NormalizeStripePriceId(rawPremiumAnnual, logger, "PremiumAnnual"),
            ["Elite Monthly"] = NormalizeStripePriceId(rawEliteMonthly, logger, "EliteMonthly"),
            ["Elite Annual"] = NormalizeStripePriceId(rawEliteAnnual, logger, "EliteAnnual"),
        };

        if (configuredPrices.Values.All(string.IsNullOrEmpty)
            && string.IsNullOrEmpty(rawMonthly)
            && string.IsNullOrEmpty(rawAnnual)
            && string.IsNullOrEmpty(rawPremiumMonthly)
            && string.IsNullOrEmpty(rawPremiumAnnual)
            && string.IsNullOrEmpty(rawEliteMonthly)
            && string.IsNullOrEmpty(rawEliteAnnual))
            return;

        var plans = await db.SubscriptionPlans.Where(p => !p.IsDeleted).ToListAsync(ct);
        var updated = false;

        foreach (var plan in plans)
        {
            if (!configuredPrices.TryGetValue(plan.Name, out var priceId))
                continue;

            if (!string.IsNullOrEmpty(priceId))
            {
                if (plan.StripePriceId == priceId)
                    continue;

                plan.StripePriceId = priceId;
                updated = true;
                continue;
            }

            var rawConfigured = plan.Name switch
            {
                "Essential Monthly" => rawMonthly,
                "Essential Annual" => rawAnnual,
                "Premium Monthly" => rawPremiumMonthly,
                "Premium Annual" => rawPremiumAnnual,
                "Elite Monthly" => rawEliteMonthly,
                "Elite Annual" => rawEliteAnnual,
                _ => null,
            };

            if (!string.IsNullOrEmpty(rawConfigured) || plan.StripePriceId?.StartsWith("prod_", StringComparison.OrdinalIgnoreCase) == true)
            {
                plan.StripePriceId = null;
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
            var target = PlanPricing.ResolvePrice(plan.BillingInterval, plan.Name, plan.PriceGbp, pricing);

            if (plan.PriceGbp == target)
                continue;

            plan.PriceGbp = target;
            updated = true;
        }

        if (updated)
        {
            await db.SaveChangesAsync(ct);
            logger.LogInformation(
                "Updated subscription plan prices (Essential £{EssentialMonthly}/£{EssentialAnnual}, Premium £{PremiumMonthly}/£{PremiumAnnual}, Elite £{EliteMonthly}/£{EliteAnnual})",
                pricing.EssentialMonthly,
                pricing.EssentialAnnual,
                pricing.PremiumMonthly,
                pricing.PremiumAnnual,
                pricing.EliteMonthly,
                pricing.EliteAnnual);
        }
    }

    private static async Task EnsurePremiumPlansAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var brandId = await db.Brands
            .Where(b => b.Code == "gardens-sorted")
            .Select(b => b.Id)
            .FirstOrDefaultAsync(ct);
        if (brandId == Guid.Empty)
            return;

        var existingNames = await db.SubscriptionPlans
            .Where(p => p.BrandId == brandId && !p.IsDeleted)
            .Select(p => p.Name)
            .ToListAsync(ct);

        var toAdd = new List<SubscriptionPlan>();
        if (!existingNames.Any(n => n.Equals("Premium Monthly", StringComparison.OrdinalIgnoreCase)))
        {
            toAdd.Add(new SubscriptionPlan
            {
                BrandId = brandId,
                Name = "Premium Monthly",
                Description = "Two garden visits per month with enhanced service, 3-month minimum.",
                BillingInterval = SubscriptionBillingInterval.Monthly,
                MinimumTermMonths = 3,
                PriceGbp = 84.99m,
            });
        }

        if (!existingNames.Any(n => n.Equals("Premium Annual", StringComparison.OrdinalIgnoreCase)))
        {
            toAdd.Add(new SubscriptionPlan
            {
                BrandId = brandId,
                Name = "Premium Annual",
                Description = "Two garden visits per month, 12-month commitment, discounted.",
                BillingInterval = SubscriptionBillingInterval.Annual,
                MinimumTermMonths = 12,
                PriceGbp = 849.90m,
            });
        }

        if (toAdd.Count == 0)
            return;

        db.SubscriptionPlans.AddRange(toAdd);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Added Premium subscription plans to the catalog");
    }

    private static async Task EnsureElitePlansAsync(SortedDbContext db, ILogger logger, CancellationToken ct)
    {
        var brandId = await db.Brands
            .Where(b => b.Code == "gardens-sorted")
            .Select(b => b.Id)
            .FirstOrDefaultAsync(ct);
        if (brandId == Guid.Empty)
            return;

        var existingNames = await db.SubscriptionPlans
            .Where(p => p.BrandId == brandId && !p.IsDeleted)
            .Select(p => p.Name)
            .ToListAsync(ct);

        var toAdd = new List<SubscriptionPlan>();
        if (!existingNames.Any(n => n.Equals("Elite Monthly", StringComparison.OrdinalIgnoreCase)))
        {
            toAdd.Add(new SubscriptionPlan
            {
                BrandId = brandId,
                Name = "Elite Monthly",
                Description = "Three garden visits per month (~every 10 days) with Premium inclusions, 3-month minimum.",
                BillingInterval = SubscriptionBillingInterval.Monthly,
                MinimumTermMonths = 3,
                PriceGbp = 119.99m,
            });
        }

        if (!existingNames.Any(n => n.Equals("Elite Annual", StringComparison.OrdinalIgnoreCase)))
        {
            toAdd.Add(new SubscriptionPlan
            {
                BrandId = brandId,
                Name = "Elite Annual",
                Description = "Three garden visits per month (~every 10 days), 12-month commitment, discounted.",
                BillingInterval = SubscriptionBillingInterval.Annual,
                MinimumTermMonths = 12,
                PriceGbp = 1199.90m,
            });
        }

        if (toAdd.Count == 0)
            return;

        db.SubscriptionPlans.AddRange(toAdd);
        await db.SaveChangesAsync(ct);
        logger.LogInformation("Added Elite subscription plans to the catalog");
    }

    private static string? NormalizeStripePriceId(string? value, ILogger logger, string settingName)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        var trimmed = value.Trim();
        if (trimmed.StartsWith("prod_", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning(
                "{Setting} is a Stripe Product ID ({ProductId}). Use a Price ID (price_...) from the product Pricing section — ignoring this value.",
                settingName,
                trimmed);
            return null;
        }

        if (!trimmed.StartsWith("price_", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning(
                "{Setting} does not look like a Stripe Price ID (expected price_...). Ignoring {Value}.",
                settingName,
                trimmed);
            return null;
        }

        return trimmed;
    }
}
