using Microsoft.AspNetCore.Mvc;
using Sorted.Core.Interfaces;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhooksController(IStripePaymentService stripe) : ControllerBase
{
    [HttpPost("stripe")]
    public async Task<IActionResult> StripeWebhook(CancellationToken ct)
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct);
        var signature = Request.Headers["Stripe-Signature"].FirstOrDefault() ?? string.Empty;
        try
        {
            await stripe.HandleWebhookAsync(json, signature, ct);
            return Ok();
        }
        catch (InvalidOperationException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable);
        }
        catch (Stripe.StripeException)
        {
            return BadRequest();
        }
    }
}
