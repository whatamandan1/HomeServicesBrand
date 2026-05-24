using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sorted.Core.Dtos;
using Sorted.Core.Interfaces;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/portfolios")]
public class PortfoliosController(IPortfolioEnquiryService enquiries) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("enquiries")]
    public async Task<ActionResult<PortfolioEnquirySubmittedResponse>> SubmitEnquiry(
        [FromBody] SubmitPortfolioEnquiryRequest request,
        CancellationToken ct)
    {
        try
        {
            var response = await enquiries.SubmitAsync(request, ct);
            return Created($"/api/portfolios/enquiries/{response.EnquiryId}", response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
