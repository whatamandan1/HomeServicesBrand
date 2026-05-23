using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Sorted.Api.Tests;

public class AuthTermsTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthTermsTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder => builder.UseEnvironment("Development")).CreateClient();
    }

    [Fact]
    public async Task Register_customer_requires_terms_acceptance()
    {
        var payload = new
        {
            email = $"terms-test-{Guid.NewGuid():N}@example.com",
            password = "Test1234!",
            firstName = "Terms",
            lastName = "Test",
            phone = "07123456789",
            line1 = "1 Test Street",
            line2 = (string?)null,
            city = "Leeds",
            postcode = "LS1 4AB",
            gardenSize = "Small",
            subscriptionPlanId = Guid.NewGuid(),
            availabilityPreference = "Weekday mornings",
            acceptedTerms = false
        };

        var response = await _client.PostAsJsonAsync("/api/auth/register/customer", payload);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(body);
        Assert.True(doc.RootElement.TryGetProperty("error", out var error));
        Assert.Contains("terms", error.GetString(), StringComparison.OrdinalIgnoreCase);
    }
}
