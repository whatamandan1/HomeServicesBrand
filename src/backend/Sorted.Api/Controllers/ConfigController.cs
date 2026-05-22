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
    public async Task<IActionResult> PublicConfig(CancellationToken ct)
    {
        var pending = await db.Database.GetPendingMigrationsAsync(ct);
        var applied = await db.Database.GetAppliedMigrationsAsync(ct);
        return Ok(new
        {
            bypassStripeCheckout = features.Value.BypassStripeCheckout,
            pendingMigrations = pending,
            appliedMigrations = applied,
            databaseReady = DatabaseMigrationState.IsReady && !pending.Any(),
            databaseError = DatabaseMigrationState.LastError,
        });
    }
}
