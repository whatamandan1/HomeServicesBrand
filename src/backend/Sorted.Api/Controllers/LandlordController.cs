using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/landlord")]
[Authorize(Roles = nameof(UserRole.Landlord))]
public class LandlordController(SortedDbContext db) : ControllerBase
{
    [HttpGet("account")]
    public async Task<ActionResult<LandlordAccountResponse>> Account(CancellationToken ct)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var account = await db.MultiPropertyAccounts.AsNoTracking()
            .Include(a => a.User)
            .Include(a => a.Properties.Where(p => !p.IsDeleted))
            .FirstOrDefaultAsync(a => a.UserId == userId && !a.IsDeleted, ct);

        if (account is null) return NotFound(new { error = "Multi-property account not found." });

        return Ok(MapAccount(account));
    }

    private Guid? GetUserId()
    {
        var sub = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        return Guid.TryParse(sub, out var id) ? id : null;
    }

    private static LandlordAccountResponse MapAccount(MultiPropertyAccount account)
    {
        var properties = account.Properties
            .Where(p => !p.IsDeleted)
            .OrderBy(p => p.SortOrder)
            .Select(p => new LandlordPropertyResponse(
                p.Id,
                p.SortOrder,
                p.Line1,
                p.Line2,
                p.City,
                p.Postcode,
                p.GardenSize,
                p.VisitFrequency,
                p.ServiceLevel,
                p.NextVisitDate))
            .ToList();

        var user = account.User;
        return new LandlordAccountResponse(
            account.Id,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            user.Phone,
            account.CompanyName,
            account.IndicativeMonthlyGbp,
            account.AgreementNotes,
            properties);
    }
}
