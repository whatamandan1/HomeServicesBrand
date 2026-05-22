using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(IOptions<FeaturesOptions> features, SortedDbContext db) : ControllerBase
{
    [HttpGet("public")]
    public async Task<IActionResult> PublicConfig(CancellationToken ct) =>
        Ok(new
        {
            bypassStripeCheckout = features.Value.BypassStripeCheckout,
            pendingMigrations = await db.Database.GetPendingMigrationsAsync(ct),
        });
}
