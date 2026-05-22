using Sorted.Core.Enums;

namespace Sorted.Core.Dtos;

public record RegisterCustomerRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Phone,
    string Line1,
    string? Line2,
    string City,
    string Postcode,
    GardenSize GardenSize,
    Guid SubscriptionPlanId,
    string AvailabilityPreference,
    string BrandCode = "gardens-sorted");

public record RegisterProviderRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    string Phone,
    string CoveragePostcode,
    double CoverageRadiusMiles);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token,
    DateTime ExpiresAtUtc,
    Guid UserId,
    string Email,
    UserRole Role,
    string? BrandCode,
    Guid? PendingSubscriptionId = null);

public record UserProfileResponse(
    Guid UserId,
    string Email,
    string FirstName,
    string LastName,
    string? Phone,
    UserRole Role);
