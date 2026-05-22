using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class AuthService(
    SortedDbContext db,
    JwtTokenService jwt,
    IWorkflowLogger workflow,
    IEmailService email,
    ISmsService sms,
    IPostcodeGeocodingService geocoding,
    IProviderCoverageService coverage) : IAuthService
{
    public async Task<AuthResponse> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw new InvalidOperationException("Email already registered.");

        var brand = await db.Brands.FirstOrDefaultAsync(b => b.Code == request.BrandCode && b.IsActive, ct)
            ?? throw new InvalidOperationException("Brand not found.");

        var plan = await db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == request.SubscriptionPlanId && p.BrandId == brand.Id, ct)
            ?? throw new InvalidOperationException("Subscription plan not found.");

        var user = new UserAccount
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
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
            Line1 = request.Line1,
            Line2 = request.Line2,
            City = request.City,
            Postcode = request.Postcode.ToUpperInvariant(),
            GardenSize = request.GardenSize,
            IsPrimary = true
        };
        db.CustomerProperties.Add(property);

        var subscription = new CustomerSubscription
        {
            CustomerId = customer.Id,
            SubscriptionPlanId = plan.Id,
            Status = SubscriptionStatus.PendingPayment,
            AvailabilityPreference = request.AvailabilityPreference
        };
        db.CustomerSubscriptions.Add(subscription);
        await db.SaveChangesAsync(ct);

        var geo = await geocoding.LookupAsync(property.Postcode, ct);
        if (geo is not null)
        {
            property.Latitude = geo.Latitude;
            property.Longitude = geo.Longitude;
            await db.SaveChangesAsync(ct);
        }

        await workflow.LogAsync("customer_signup", "registered", nameof(Customer), customer.Id, new { user.Email, plan.Name }, ct);
        await email.SendWelcomeEmailAsync(user.Email, user.FirstName, ct);
        if (!string.IsNullOrWhiteSpace(user.Phone))
            await sms.SendWelcomeSmsAsync(user.Phone, user.FirstName, ct);

        var (token, expires) = jwt.CreateToken(user, brand.Code);
        return new AuthResponse(token, expires, user.Id, user.Email, user.Role, brand.Code, subscription.Id);
    }

    public async Task<AuthResponse> RegisterProviderAsync(RegisterProviderRequest request, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(u => u.Email == request.Email, ct))
            throw new InvalidOperationException("Email already registered.");

        var radius = request.CoverageRadiusMiles;
        if (radius is < 1 or > 50)
            throw new InvalidOperationException("Coverage radius must be between 1 and 50 miles.");

        var geo = await geocoding.LookupAsync(PostcodeFormat.Normalize(request.CoveragePostcode), ct)
            ?? throw new InvalidOperationException("Could not find that postcode. Check it is a valid UK postcode.");

        var user = new UserAccount
        {
            Email = request.Email.Trim().ToLowerInvariant(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            Role = UserRole.Provider
        };
        db.Users.Add(user);
        await db.SaveChangesAsync(ct);

        var provider = new Provider
        {
            UserId = user.Id,
            IsApproved = false,
            CoveragePostcode = geo.Postcode,
            CoverageLatitude = geo.Latitude,
            CoverageLongitude = geo.Longitude,
            CoverageRadiusMiles = radius
        };
        db.Providers.Add(provider);
        await db.SaveChangesAsync(ct);

        coverage.ScheduleTerritorySync(provider.Id);

        await workflow.LogAsync(
            "provider_onboarding",
            "registered",
            nameof(Provider),
            provider.Id,
            new { user.Email, geo.Postcode, radius },
            ct);

        var (token, expires) = jwt.CreateToken(user, null);
        return new AuthResponse(token, expires, user.Id, user.Email, user.Role, null);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive && !u.IsDeleted, ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");

        string? brandCode = null;
        if (user.BrandId.HasValue)
            brandCode = await db.Brands.Where(b => b.Id == user.BrandId).Select(b => b.Code).FirstOrDefaultAsync(ct);

        var (token, expires) = jwt.CreateToken(user, brandCode);
        return new AuthResponse(token, expires, user.Id, user.Email, user.Role, brandCode);
    }

    public async Task<UserProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, ct);
        return user is null ? null : new UserProfileResponse(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.Role);
    }
}
