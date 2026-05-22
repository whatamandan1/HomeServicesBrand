using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/brands")]
public class BrandsController(SortedDbContext db) : ControllerBase
{
    [HttpGet("{code}")]
    [AllowAnonymous]
    public async Task<ActionResult<BrandResponse>> GetByCode(string code, CancellationToken ct)
    {
        var brand = await db.Brands.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Code == code && b.IsActive && !b.IsDeleted, ct);
        return brand is null ? NotFound() : Ok(new BrandResponse(brand.Id, brand.Code, brand.Name, brand.PrimaryDomain));
    }

    [HttpGet("{code}/plans")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<SubscriptionPlanResponse>>> GetPlans(string code, CancellationToken ct)
    {
        var brandId = await db.Brands.AsNoTracking()
            .Where(b => b.Code == code && b.IsActive && !b.IsDeleted)
            .Select(b => b.Id)
            .FirstOrDefaultAsync(ct);
        if (brandId == Guid.Empty) return NotFound();

        var plans = await db.SubscriptionPlans.AsNoTracking()
            .Where(p => p.BrandId == brandId && p.IsActive && !p.IsDeleted)
            .Select(p => new SubscriptionPlanResponse(p.Id, p.Name, p.Description, p.BillingInterval, p.MinimumTermMonths, p.PriceGbp))
            .ToListAsync(ct);
        return Ok(plans);
    }
}
