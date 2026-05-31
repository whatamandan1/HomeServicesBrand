using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sorted.Core.Dtos;
using Sorted.Core.Plans;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;
using Sorted.Infrastructure.Services;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/brands")]
public class BrandsController(SortedDbContext db, IOptions<PlanPricingOptions> pricing) : ControllerBase
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

        // Compare plan names directly - EF cannot translate PlanCatalog.IsOfferedAtSignup.
        var plans = await db.SubscriptionPlans.AsNoTracking()
            .Where(p => p.BrandId == brandId && p.IsActive && !p.IsDeleted
                && (p.Name == PlanCatalog.SignupMonthlyPlanName
                    || p.Name == PlanCatalog.PremiumMonthlyPlanName
                    || p.Name == PlanCatalog.EliteMonthlyPlanName))
            .ToListAsync(ct);

        var opts = pricing.Value;
        return Ok(plans.Select(p => new SubscriptionPlanResponse(
            p.Id,
            p.Name,
            p.Description,
            p.BillingInterval,
            p.MinimumTermMonths,
            PlanPricing.ResolvePrice(p, opts))));
    }
}
