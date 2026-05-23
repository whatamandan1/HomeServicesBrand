using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sorted.Core.Interfaces;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/geo")]
[AllowAnonymous]
public class GeoController(IPostcodeGeocodingService geocoding) : ControllerBase
{
    [HttpGet("postcodes/{postcode}")]
    public async Task<ActionResult> LookupPostcode(string postcode, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(postcode))
            return BadRequest(new { error = "Postcode is required." });

        var geo = await geocoding.LookupAsync(postcode, ct);
        if (geo is null) return NotFound(new { error = "Postcode not found." });

        return Ok(new
        {
            postcode = geo.Postcode,
            latitude = geo.Latitude,
            longitude = geo.Longitude,
        });
    }
}
