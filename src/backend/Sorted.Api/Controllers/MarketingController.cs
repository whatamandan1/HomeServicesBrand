using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sorted.Core.Dtos;
using Sorted.Core.Interfaces;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/marketing")]
public class MarketingController(ISignupLeadService signupLeads) : ControllerBase
{
    [HttpPost("signup-leads")]
    [AllowAnonymous]
    public async Task<ActionResult<CaptureSignupLeadResponse>> CaptureSignupLead(
        [FromBody] CaptureSignupLeadRequest request,
        CancellationToken ct)
    {
        try
        {
            return Ok(await signupLeads.CaptureAsync(request, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
