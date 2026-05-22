using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sorted.Core.Dtos;
using Sorted.Core.Interfaces;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/support")]
public class SupportController(IAiSupportService ai) : ControllerBase
{
    [HttpPost("chat")]
    [AllowAnonymous]
    public async Task<ActionResult<SupportChatResponse>> GuestChat([FromBody] SupportChatRequest request, CancellationToken ct)
        => Ok(await ai.GuestChatAsync(request, ct));
}
