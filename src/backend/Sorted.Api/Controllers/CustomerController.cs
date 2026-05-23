using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Geo;
using Sorted.Core.Interfaces;
using Sorted.Core.Plans;
using Sorted.Infrastructure.Data;

namespace Sorted.Api.Controllers;

[ApiController]
[Route("api/customer")]
[Authorize(Roles = nameof(UserRole.Customer))]
public class CustomerController(
    SortedDbContext db,
    IStripePaymentService stripe,
    IAiSupportService ai,
    IVisitManagementService visits,
    IPostcodeGeocodingService geocoding,
    IWorkflowLogger workflow) : ControllerBase
{
    private async Task<Guid> GetCustomerIdAsync(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        return await db.Customers.Where(c => c.UserId == userId).Select(c => c.Id).FirstAsync(ct);
    }

    [HttpGet("subscriptions")]
    public async Task<ActionResult<IEnumerable<CustomerSubscriptionResponse>>> Subscriptions(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var subs = await db.CustomerSubscriptions.AsNoTracking()
            .Include(s => s.Plan)
            .Include(s => s.PreferredProvider).ThenInclude(p => p!.User)
            .Where(s => s.CustomerId == customerId && !s.IsDeleted)
            .ToListAsync(ct);

        var responses = subs.Select(s => new CustomerSubscriptionResponse(
            s.Id,
            s.Plan.Name,
            s.Plan.BillingInterval,
            s.Status,
            s.StartedAtUtc,
            s.AvailabilityPreference,
            s.EndsAtUtc,
            s.CancelsAtUtc,
            CanManageBilling(s),
            CanUpgradeToPremium(s),
            s.PreferredProvider is null
                ? null
                : $"{s.PreferredProvider.User.FirstName} {s.PreferredProvider.User.LastName}".Trim())).ToList();

        return Ok(responses);
    }

    private static bool CanManageBilling(CustomerSubscription s) =>
        s.Status != SubscriptionStatus.PendingPayment
        && (!string.IsNullOrWhiteSpace(s.StripeCustomerId)
            || !string.IsNullOrWhiteSpace(s.StripeSubscriptionId));

    private static bool CanUpgradeToPremium(CustomerSubscription s) =>
        s.Status is SubscriptionStatus.Active or SubscriptionStatus.PastDue
        && s.CancelsAtUtc is null
        && !PlanCatalog.IsPremium(s.Plan.Name);

    [HttpGet("payments")]
    public async Task<ActionResult<IEnumerable<CustomerPaymentResponse>>> Payments(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var payments = await db.Payments.AsNoTracking()
            .Include(p => p.Subscription).ThenInclude(s => s.Plan)
            .Where(p => p.Subscription.CustomerId == customerId
                && !p.IsDeleted
                && p.Status == PaymentStatus.Succeeded)
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new CustomerPaymentResponse(
                p.Id,
                p.Subscription.Plan.Name,
                p.AmountGbp,
                p.Status,
                p.CreatedAtUtc,
                p.StripeInvoiceId))
            .ToListAsync(ct);

        return Ok(payments);
    }

    [HttpPost("subscriptions/{subscriptionId:guid}/upgrade")]
    public async Task<ActionResult<UpgradeSubscriptionResponse>> UpgradeToPremium(Guid subscriptionId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.Customer.UserId == userId && !s.IsDeleted, ct);
        if (sub is null) return NotFound();

        try
        {
            return Ok(await stripe.UpgradeToPremiumAsync(sub, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("subscriptions/{subscriptionId:guid}/switch-to-annual")]
    public async Task<ActionResult<SwitchToAnnualBillingResponse>> SwitchToAnnual(Guid subscriptionId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.Customer.UserId == userId && !s.IsDeleted, ct);
        if (sub is null) return NotFound();

        try
        {
            return Ok(await stripe.SwitchToAnnualBillingAsync(sub, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("subscriptions/{subscriptionId:guid}/billing-portal")]
    public async Task<ActionResult<BillingPortalSessionResponse>> BillingPortal(Guid subscriptionId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Customer)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.Customer.UserId == userId && !s.IsDeleted, ct);
        if (sub is null) return NotFound();

        try
        {
            return Ok(await stripe.CreateBillingPortalSessionAsync(sub, ct));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("subscriptions/{subscriptionId:guid}/checkout")]
    public async Task<ActionResult<CheckoutSessionResponse>> Checkout(Guid subscriptionId, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var sub = await db.CustomerSubscriptions
            .Include(s => s.Plan)
            .Include(s => s.Customer).ThenInclude(c => c.User)
            .FirstOrDefaultAsync(s => s.Id == subscriptionId && s.Customer.UserId == userId, ct);
        if (sub is null) return NotFound();
        if (sub.Status != SubscriptionStatus.PendingPayment)
            return BadRequest(new { error = "Subscription is not awaiting payment." });

        try
        {
            var session = await stripe.CreateSignupCheckoutAsync(sub, sub.Plan, sub.Customer.User.Email, ct);
            return Ok(session);
        }
        catch (Exception ex)
        {
            var detail = ex.GetBaseException().Message;
            return BadRequest(new { error = detail });
        }
    }

    [HttpGet("visits")]
    public async Task<ActionResult<IEnumerable<JobVisitResponse>>> Visits(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var visits = await db.JobVisits.AsNoTracking()
            .Where(v => v.Subscription.CustomerId == customerId && !v.IsDeleted)
            .OrderBy(v => v.ScheduledDate)
            .Select(v => new JobVisitResponse(
                v.Id,
                v.ScheduledDate,
                v.AvailabilityWindow,
                v.Status,
                v.Property.Postcode,
                v.AssignedProvider != null ? v.AssignedProvider.User.FirstName + " " + v.AssignedProvider.User.LastName : null,
                v.Property.Latitude,
                v.Property.Longitude))
            .ToListAsync(ct);
        return Ok(visits);
    }

    [HttpPost("visits/{visitId:guid}/cancel")]
    public async Task<ActionResult<JobVisitResponse>> CancelVisit(Guid visitId, CancellationToken ct)
    {
        try
        {
            var customerId = await GetCustomerIdAsync(ct);
            var result = await visits.CancelVisitAsync(visitId, customerId, allowInProgress: false, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("visits/{visitId:guid}/reschedule")]
    public async Task<ActionResult<JobVisitResponse>> RescheduleVisit(
        Guid visitId,
        [FromBody] RescheduleVisitRequest request,
        CancellationToken ct)
    {
        try
        {
            var customerId = await GetCustomerIdAsync(ct);
            var result = await visits.RescheduleVisitAsync(
                visitId,
                request.ScheduledDate,
                customerId,
                allowInProgress: false,
                ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("support/chat")]
    public async Task<ActionResult<SupportChatResponse>> SupportChat([FromBody] SupportChatRequest request, CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        return Ok(await ai.ChatAsync(customerId, request, ct));
    }

    [HttpGet("properties")]
    public async Task<ActionResult<IEnumerable<CustomerPropertyResponse>>> Properties(CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var list = await db.CustomerProperties.AsNoTracking()
            .Where(p => p.CustomerId == customerId && !p.IsDeleted)
            .OrderByDescending(p => p.IsPrimary)
            .ThenBy(p => p.CreatedAtUtc)
            .Select(p => new CustomerPropertyResponse(
                p.Id,
                p.Line1,
                p.Line2,
                p.City,
                p.Postcode,
                p.GardenSize,
                p.AccessNotes,
                p.IsPrimary,
                db.PropertyMedia.Count(m => m.CustomerPropertyId == p.Id && !m.IsDeleted)))
            .ToListAsync(ct);
        return Ok(list);
    }

    [HttpPut("properties/{propertyId:guid}")]
    public async Task<ActionResult<CustomerPropertyResponse>> UpdateProperty(
        Guid propertyId,
        [FromBody] UpdateCustomerPropertyRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Line1)
            || string.IsNullOrWhiteSpace(request.City)
            || string.IsNullOrWhiteSpace(request.Postcode))
            return BadRequest(new { error = "Address line 1, city, and postcode are required." });

        var customerId = await GetCustomerIdAsync(ct);
        var property = await db.CustomerProperties
            .FirstOrDefaultAsync(p => p.Id == propertyId && p.CustomerId == customerId && !p.IsDeleted, ct);
        if (property is null) return NotFound();

        var normalizedPostcode = PostcodeFormat.Normalize(request.Postcode);
        var postcodeChanged = !string.Equals(property.Postcode, normalizedPostcode, StringComparison.OrdinalIgnoreCase);

        property.Line1 = request.Line1.Trim();
        property.Line2 = string.IsNullOrWhiteSpace(request.Line2) ? null : request.Line2.Trim();
        property.City = request.City.Trim();
        property.Postcode = normalizedPostcode;
        property.GardenSize = request.GardenSize;
        property.AccessNotes = string.IsNullOrWhiteSpace(request.AccessNotes) ? null : request.AccessNotes.Trim();
        property.UpdatedAtUtc = DateTime.UtcNow;

        if (postcodeChanged)
        {
            var geo = await geocoding.LookupAsync(property.Postcode, ct);
            property.Latitude = geo?.Latitude;
            property.Longitude = geo?.Longitude;
        }

        await db.SaveChangesAsync(ct);
        await workflow.LogAsync(
            "customer_property",
            "updated",
            nameof(CustomerProperty),
            property.Id,
            new { property.Postcode, property.GardenSize },
            ct);

        return Ok(new CustomerPropertyResponse(
            property.Id,
            property.Line1,
            property.Line2,
            property.City,
            property.Postcode,
            property.GardenSize,
            property.AccessNotes,
            property.IsPrimary,
            await db.PropertyMedia.CountAsync(m => m.CustomerPropertyId == property.Id && !m.IsDeleted, ct)));
    }

    private const int MaxPhotosPerProperty = 3;
    private const int MaxPhotoBytes = 512 * 1024;
    private static readonly HashSet<string> AllowedPhotoContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    [HttpGet("properties/{propertyId:guid}/photos")]
    public async Task<ActionResult<PropertyMediaListResponse>> PropertyPhotos(Guid propertyId, CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var property = await db.CustomerProperties.AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == propertyId && p.CustomerId == customerId && !p.IsDeleted, ct);
        if (property is null) return NotFound();

        var photos = await db.PropertyMedia.AsNoTracking()
            .Where(m => m.CustomerPropertyId == propertyId && !m.IsDeleted)
            .OrderBy(m => m.CreatedAtUtc)
            .Select(m => new PropertyMediaResponse(
                m.Id,
                m.FileName,
                m.ContentType,
                m.SizeBytes,
                m.CreatedAtUtc))
            .ToListAsync(ct);

        return Ok(new PropertyMediaListResponse(propertyId, photos));
    }

    [HttpGet("properties/photos/{photoId:guid}")]
    public async Task<IActionResult> PropertyPhoto(Guid photoId, CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var photo = await db.PropertyMedia.AsNoTracking()
            .Include(m => m.Property)
            .FirstOrDefaultAsync(m => m.Id == photoId && !m.IsDeleted, ct);
        if (photo is null || photo.Property.CustomerId != customerId)
            return NotFound();

        return File(photo.Data, photo.ContentType);
    }

    [HttpPost("properties/{propertyId:guid}/photos")]
    [RequestSizeLimit(MaxPhotoBytes + 1024)]
    public async Task<ActionResult<PropertyMediaResponse>> UploadPropertyPhoto(
        Guid propertyId,
        IFormFile file,
        CancellationToken ct)
    {
        if (file.Length == 0)
            return BadRequest(new { error = "Choose a photo to upload." });
        if (file.Length > MaxPhotoBytes)
            return BadRequest(new { error = "Photo must be 512 KB or smaller." });
        if (!AllowedPhotoContentTypes.Contains(file.ContentType))
            return BadRequest(new { error = "Only JPEG, PNG, and WebP photos are supported." });

        var customerId = await GetCustomerIdAsync(ct);
        var property = await db.CustomerProperties
            .FirstOrDefaultAsync(p => p.Id == propertyId && p.CustomerId == customerId && !p.IsDeleted, ct);
        if (property is null) return NotFound();

        var existingCount = await db.PropertyMedia.CountAsync(
            m => m.CustomerPropertyId == propertyId && !m.IsDeleted,
            ct);
        if (existingCount >= MaxPhotosPerProperty)
            return BadRequest(new { error = $"You can upload up to {MaxPhotosPerProperty} photos per property." });

        await using var stream = new MemoryStream();
        await file.CopyToAsync(stream, ct);
        var data = stream.ToArray();

        var media = new PropertyMedia
        {
            CustomerPropertyId = propertyId,
            FileName = Path.GetFileName(file.FileName),
            ContentType = file.ContentType,
            Data = data,
            SizeBytes = data.Length
        };
        db.PropertyMedia.Add(media);
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "customer_property",
            "photo_uploaded",
            nameof(PropertyMedia),
            media.Id,
            new { propertyId, media.SizeBytes },
            ct);

        return Ok(new PropertyMediaResponse(
            media.Id,
            media.FileName,
            media.ContentType,
            media.SizeBytes,
            media.CreatedAtUtc));
    }

    [HttpDelete("properties/photos/{photoId:guid}")]
    public async Task<IActionResult> DeletePropertyPhoto(Guid photoId, CancellationToken ct)
    {
        var customerId = await GetCustomerIdAsync(ct);
        var photo = await db.PropertyMedia
            .Include(m => m.Property)
            .FirstOrDefaultAsync(m => m.Id == photoId && !m.IsDeleted, ct);
        if (photo is null || photo.Property.CustomerId != customerId)
            return NotFound();

        photo.IsDeleted = true;
        photo.UpdatedAtUtc = DateTime.UtcNow;
        await db.SaveChangesAsync(ct);

        await workflow.LogAsync(
            "customer_property",
            "photo_deleted",
            nameof(PropertyMedia),
            photo.Id,
            new { photo.CustomerPropertyId },
            ct);

        return NoContent();
    }
}
