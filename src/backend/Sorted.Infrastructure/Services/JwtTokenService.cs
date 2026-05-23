using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sorted.Core.Entities;
using Sorted.Core.Options;

namespace Sorted.Infrastructure.Services;

public class JwtTokenService(IOptions<JwtOptions> options)
{
    private readonly JwtOptions _options = options.Value;

    public (string Token, DateTime ExpiresAtUtc) CreateToken(
        UserAccount user,
        string? brandCode,
        Guid? impersonatorUserId = null,
        string? impersonatorEmail = null)
    {
        var expires = DateTime.UtcNow.AddHours(_options.ExpiryHours);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("firstName", user.FirstName),
            new("lastName", user.LastName)
        };
        if (brandCode is not null)
            claims.Add(new Claim("brandCode", brandCode));
        if (impersonatorUserId is not null)
        {
            claims.Add(new Claim("impersonatorId", impersonatorUserId.Value.ToString()));
            if (!string.IsNullOrWhiteSpace(impersonatorEmail))
                claims.Add(new Claim("impersonatorEmail", impersonatorEmail));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
