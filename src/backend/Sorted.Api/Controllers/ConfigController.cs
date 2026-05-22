using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Sorted.Core.Options;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/config")]
public class ConfigController(IOptions<FeaturesOptions> features) : ControllerBase
{
    [HttpGet("public")]
    public IActionResult PublicConfig() =>
        Ok(new
        {
            bypassStripeCheckout = features.Value.BypassStripeCheckout,
        });
}
