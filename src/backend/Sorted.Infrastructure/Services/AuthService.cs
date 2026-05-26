using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class AuthService(
    SortedDbContext db,
    JwtTokenService jwt,
    IWorkflowLogger workflow,
    IEmailService email,
    ISmsService sms,
    IPostcodeGeocodingService geocoding,
    IProviderCoverageService coverage,
    ISignupLeadService signupLeads,
    IServiceScopeFactory scopeFactory,
    IOptions<AppOptions> appOptions) : IAuthService
{
    private readonly AppOptions _appOptions = appOptions.Value;
    public async Task<AuthResponse> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken ct = default)
    {
        if (!request.AcceptedTerms)
            throw new InvalidOperationException("You must accept the terms of service to sign up.");

        if (string.IsNullOrWhiteSpace(request.LastName))
            throw new InvalidOperationException("Enter your last name.");

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

        var customer = new Customer
        {
            UserId = user.Id,
            BrandId = brand.Id,
            TermsAcceptedAtUtc = DateTime.UtcNow
        };
        db.Customers.Add(customer);

        var property = new CustomerProperty
        {
            Customer = customer,
            Line1 = request.Line1,
            Line2 = request.Line2,
            City = request.City,
            Postcode = PostcodeFormat.Normalize(request.Postcode),
            GardenSize = request.GardenSize,
            IsPrimary = true
        };
        db.CustomerProperties.Add(property);

        var subscription = new CustomerSubscription
        {
            Customer = customer,
            SubscriptionPlanId = plan.Id,
            Status = SubscriptionStatus.PendingPayment,
            AvailabilityPreference = request.AvailabilityPreference
        };
        db.CustomerSubscriptions.Add(subscription);
        await db.SaveChangesAsync(ct);

        SchedulePropertyGeocoding(property.Id, property.Postcode);

        await workflow.LogAsync("customer_signup", "registered", nameof(Customer), customer.Id, new { user.Email, plan.Name }, ct);

        await signupLeads.MarkConvertedAsync(user.Email, brand.Code, ct);

        var welcomeEmail = user.Email;
        var welcomeFirstName = user.FirstName;
        var welcomePhone = user.Phone;
        _ = Task.Run(async () =>
        {
            try
            {
                await email.SendWelcomeEmailAsync(welcomeEmail, welcomeFirstName, CancellationToken.None);
                if (!string.IsNullOrWhiteSpace(welcomePhone))
                    await sms.SendWelcomeSmsAsync(welcomePhone, welcomeFirstName, CancellationToken.None);
            }
            catch
            {
                // Welcome notifications should not block signup completion.
            }
        });

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

        Guid? pendingSubscriptionId = null;
        if (user.Role == UserRole.Customer)
        {
            pendingSubscriptionId = await db.Customers.AsNoTracking()
                .Where(c => c.UserId == user.Id && !c.IsDeleted)
                .SelectMany(c => c.Subscriptions)
                .Where(s => s.Status == SubscriptionStatus.PendingPayment && !s.IsDeleted)
                .OrderByDescending(s => s.CreatedAtUtc)
                .Select(s => (Guid?)s.Id)
                .FirstOrDefaultAsync(ct);
        }

        var (token, expires) = jwt.CreateToken(user, brandCode);
        return new AuthResponse(token, expires, user.Id, user.Email, user.Role, brandCode, pendingSubscriptionId);
    }

    public async Task<AuthResponse> ImpersonateAsync(
        Guid targetUserId,
        Guid adminUserId,
        string adminEmail,
        CancellationToken ct = default)
    {
        if (targetUserId == adminUserId)
            throw new InvalidOperationException("Cannot impersonate yourself.");

        var target = await db.Users.FirstOrDefaultAsync(u => u.Id == targetUserId && u.IsActive && !u.IsDeleted, ct)
            ?? throw new InvalidOperationException("User not found.");

        if (target.Role == UserRole.Admin)
            throw new InvalidOperationException("Cannot impersonate an admin account.");

        string? brandCode = null;
        if (target.BrandId.HasValue)
            brandCode = await db.Brands.Where(b => b.Id == target.BrandId).Select(b => b.Code).FirstOrDefaultAsync(ct);

        Guid? pendingSubscriptionId = null;
        if (target.Role == UserRole.Customer)
        {
            pendingSubscriptionId = await db.Customers.AsNoTracking()
                .Where(c => c.UserId == target.Id && !c.IsDeleted)
                .SelectMany(c => c.Subscriptions)
                .Where(s => s.Status == SubscriptionStatus.PendingPayment && !s.IsDeleted)
                .OrderByDescending(s => s.CreatedAtUtc)
                .Select(s => (Guid?)s.Id)
                .FirstOrDefaultAsync(ct);
        }

        var (token, expires) = jwt.CreateToken(target, brandCode, adminUserId, adminEmail);
        await workflow.LogAsync(
            "admin",
            "impersonation_started",
            nameof(UserAccount),
            target.Id,
            new { adminUserId, adminEmail, targetEmail = target.Email, role = target.Role.ToString() },
            ct);

        return new AuthResponse(
            token,
            expires,
            target.Id,
            target.Email,
            target.Role,
            brandCode,
            pendingSubscriptionId,
            adminUserId,
            adminEmail);
    }

    public async Task<UserProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, ct);
        return user is null ? null : new UserProfileResponse(user.Id, user.Email, user.FirstName, user.LastName, user.Phone, user.Role);
    }

    public async Task RequestPasswordResetAsync(string emailAddress, CancellationToken ct = default)
    {
        var normalized = emailAddress.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == normalized && u.IsActive && !u.IsDeleted, ct);
        if (user is null) return;

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        var hash = HashResetToken(token);

        db.PasswordResetTokens.Add(new PasswordResetToken
        {
            UserId = user.Id,
            TokenHash = hash,
            ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
        });
        await db.SaveChangesAsync(ct);

        var resetUrl =
            $"{_appOptions.FrontendBaseUrl.TrimEnd('/')}/reset-password?token={Uri.EscapeDataString(token)}";
        await email.SendPasswordResetEmailAsync(user.Email, resetUrl, ct);
    }

    public async Task ResetPasswordAsync(string token, string newPassword, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(newPassword))
            throw new InvalidOperationException("Token and new password are required.");
        if (newPassword.Length < 8)
            throw new InvalidOperationException("Password must be at least 8 characters.");

        var hash = HashResetToken(token);
        var reset = await db.PasswordResetTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(
                t => t.TokenHash == hash && t.UsedAtUtc == null && t.ExpiresAtUtc > DateTime.UtcNow,
                ct)
            ?? throw new InvalidOperationException("This reset link is invalid or has expired.");

        reset.User.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        reset.UsedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);
    }

    private static string HashResetToken(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    private void SchedulePropertyGeocoding(Guid propertyId, string postcode)
    {
        _ = Task.Run(async () =>
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var scopedDb = scope.ServiceProvider.GetRequiredService<SortedDbContext>();
                var scopedGeocoding = scope.ServiceProvider.GetRequiredService<IPostcodeGeocodingService>();
                var geo = await scopedGeocoding.LookupAsync(postcode, CancellationToken.None);
                if (geo is null) return;

                var property = await scopedDb.CustomerProperties
                    .FirstOrDefaultAsync(p => p.Id == propertyId && !p.IsDeleted);
                if (property is null) return;

                property.Latitude = geo.Latitude;
                property.Longitude = geo.Longitude;
                property.UpdatedAtUtc = DateTime.UtcNow;
                await scopedDb.SaveChangesAsync();
            }
            catch
            {
                // Geocoding should not block signup completion.
            }
        });
    }
}
