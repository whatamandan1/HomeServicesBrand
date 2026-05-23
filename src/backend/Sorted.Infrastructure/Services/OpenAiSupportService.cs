using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;
using System.ClientModel;

namespace Sorted.Infrastructure.Services;

public class OpenAiSupportService(
    SortedDbContext db,
    IOptions<OpenAiOptions> options,
    ILogger<OpenAiSupportService> logger) : IAiSupportService
{
    private const double EscalationThreshold = 0.55;
    private const int MaxHistoryMessages = 20;
    private static readonly string[] EscalationKeywords = ["cancel", "refund", "complaint", "dispute", "angry", "broken", "urgent"];

    public Task<SupportChatResponse> ChatAsync(Guid customerId, SupportChatRequest request, CancellationToken ct = default)
        => HandleChatAsync(
            request,
            ct,
            customerId,
            threadQuery: threadId => db.CommunicationThreads
                .Include(t => t.Messages)
                .FirstOrDefaultAsync(t => t.Id == threadId && t.CustomerId == customerId, ct),
            newThread: () => new CommunicationThread { CustomerId = customerId, Subject = "Support chat" },
            senderRole: "Customer");

    public Task<SupportChatResponse> GuestChatAsync(SupportChatRequest request, CancellationToken ct = default)
        => HandleChatAsync(
            request,
            ct,
            customerId: null,
            threadQuery: threadId => db.CommunicationThreads
                .Include(t => t.Messages)
                .FirstOrDefaultAsync(t => t.Id == threadId && t.CustomerId == null, ct),
            newThread: () => new CommunicationThread { CustomerId = null, Subject = "Website chat" },
            senderRole: "Visitor");

    private async Task<SupportChatResponse> HandleChatAsync(
        SupportChatRequest request,
        CancellationToken ct,
        Guid? customerId,
        Func<Guid, Task<CommunicationThread?>> threadQuery,
        Func<CommunicationThread> newThread,
        string senderRole)
    {
        var thread = request.ThreadId.HasValue
            ? await threadQuery(request.ThreadId.Value)
            : null;

        if (thread is null)
        {
            thread = newThread();
            db.CommunicationThreads.Add(thread);
            await db.SaveChangesAsync(ct);
        }

        db.Messages.Add(new Message { ThreadId = thread.Id, SenderRole = senderRole, Body = request.Message });
        await db.SaveChangesAsync(ct);

        var reply = await GenerateReplyAsync(thread.Id, customerId, ct);
        var confidence = EstimateConfidence(request.Message, reply);
        var infraFailure = reply.Contains("having trouble connecting", StringComparison.OrdinalIgnoreCase);
        var shouldEscalate = !infraFailure && (
            confidence < EscalationThreshold
            || EscalationKeywords.Any(k => request.Message.Contains(k, StringComparison.OrdinalIgnoreCase)));

        if (shouldEscalate)
        {
            db.Escalations.Add(new Escalation
            {
                CustomerId = customerId,
                Reason = $"AI escalation ({(customerId.HasValue ? "customer" : "website")}): {request.Message[..Math.Min(200, request.Message.Length)]}",
                Status = EscalationStatus.Open
            });
            reply = BuildEscalationReply(request.Message, customerId.HasValue);
        }

        db.Messages.Add(new Message { ThreadId = thread.Id, SenderRole = "AI", Body = reply, IsFromAi = true });
        db.AIActionLogs.Add(new AIActionLog
        {
            CustomerId = customerId,
            ActionType = customerId.HasValue ? "support_chat" : "guest_chat",
            PromptSummary = request.Message[..Math.Min(500, request.Message.Length)],
            ResponseSummary = reply[..Math.Min(500, reply.Length)],
            ConfidenceScore = confidence,
            Escalated = shouldEscalate
        });
        await db.SaveChangesAsync(ct);

        return new SupportChatResponse(thread.Id, reply, shouldEscalate, confidence);
    }

    private async Task<string> GenerateReplyAsync(Guid threadId, Guid? customerId, CancellationToken ct)
    {
        var apiKey = options.Value.ApiKey?.Trim();
        var model = string.IsNullOrWhiteSpace(options.Value.Model) ? "gpt-4o-mini" : options.Value.Model.Trim();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return "Thanks for your message. Our team will follow up shortly. (OpenAI not configured — add OpenAI__ApiKey to enable live AI replies.)";
        }

        try
        {
            var history = await db.Messages.AsNoTracking()
                .Where(m => m.ThreadId == threadId)
                .OrderByDescending(m => m.CreatedAtUtc)
                .Take(MaxHistoryMessages)
                .ToListAsync(ct);
            history.Reverse();

            var context = customerId.HasValue
                ? await BuildCustomerContextAsync(customerId.Value, ct)
                : await BuildGuestContextAsync(ct);

            var systemPrompt = customerId.HasValue
                ? "You are GardensSorted customer support for a Yorkshire UK gardening subscription service. " +
                  "Be brief, friendly, and factual. Use the customer account context when answering about their plan or visits. " +
                  "For cancellations, plan changes, billing disputes, or refunds, confirm the request has been escalated to the team — do not tell them to email billing or contact support separately. " +
                  "Topics: visit windows, subscription plans, property access, billing questions.\n\n"
                : "You are GardensSorted's friendly website assistant for a Yorkshire UK gardening subscription service. " +
                  "The visitor is NOT signed in — answer pre-sales questions about how the service works, pricing, coverage, and signup. " +
                  "Be brief, warm, and helpful. Encourage signup at /signup when they seem ready. " +
                  "Do not invent account-specific details (visits, billing) — they need to sign up first for that. " +
                  "For refunds, cancellations, or complaints, confirm a human will follow up — do not ask them to contact billing separately.\n\n";

            var client = new ChatClient(model, apiKey);

            var chatMessages = new List<ChatMessage>
            {
                new SystemChatMessage(systemPrompt + context)
            };

            foreach (var msg in history)
            {
                if (msg.SenderRole is "Customer" or "User" or "Visitor")
                    chatMessages.Add(new UserChatMessage(msg.Body));
                else if (msg.SenderRole is "AI" or "Assistant")
                    chatMessages.Add(new AssistantChatMessage(msg.Body));
            }

            var completion = await client.CompleteChatAsync(chatMessages, cancellationToken: ct);
            var content = completion.Value.Content;
            if (content is null || content.Count == 0)
                return "I could not generate a response right now. Please try again in a moment.";

            return content[0].Text ?? "I could not generate a response.";
        }
        catch (ClientResultException ex)
        {
            logger.LogWarning(ex, "OpenAI API error {Status} for chat thread {ThreadId}", ex.Status, threadId);
            return "Sorry — I'm having trouble connecting right now. Your message is saved and our team will follow up shortly.";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "OpenAI support chat failed for thread {ThreadId}", threadId);
            return "Sorry — I'm having trouble connecting right now. Your message is saved and our team will follow up shortly.";
        }
    }

    private async Task<string> BuildGuestContextAsync(CancellationToken ct)
    {
        var plans = await db.SubscriptionPlans.AsNoTracking()
            .Where(p => p.IsActive && !p.IsDeleted)
            .OrderBy(p => p.PriceGbp)
            .Select(p => new { p.Name, p.Description, p.BillingInterval, p.MinimumTermMonths, p.PriceGbp })
            .ToListAsync(ct);

        var planLines = plans.Count > 0
            ? string.Join("\n", plans.Select(p =>
                $"- {p.Name}: £{p.PriceGbp}/{(p.BillingInterval == SubscriptionBillingInterval.Monthly ? "month" : "year")}, {p.MinimumTermMonths}-month minimum. {p.Description}"))
            : "- Essential Monthly: £29.95/month, 3-month minimum\n- Essential Annual: £299.95/year, 12-month minimum";

        return $"""
            Visitor status: Not signed in (pre-sales / general questions)
            Service area: Yorkshire, UK (Leeds, York, and surrounding areas — launching)
            How it works: Subscribe online → recurring visits scheduled → local gardeners assigned
            Current plans:
            {planLines}
            Signup: gardenssorted.co.uk/signup
            """;
    }

    private async Task<string> BuildCustomerContextAsync(Guid customerId, CancellationToken ct)
    {
        var customer = await db.Customers.AsNoTracking()
            .Include(c => c.User)
            .Include(c => c.Properties)
            .Include(c => c.Subscriptions).ThenInclude(s => s.Plan)
            .FirstOrDefaultAsync(c => c.Id == customerId, ct);

        if (customer is null)
            return "Customer account context unavailable.";

        var primaryProperty = customer.Properties.FirstOrDefault(p => p.IsPrimary) ?? customer.Properties.FirstOrDefault();
        var activeSubs = customer.Subscriptions
            .Where(s => s.Status is SubscriptionStatus.Active or SubscriptionStatus.PendingPayment)
            .Select(s => $"{s.Plan.Name} ({s.Status}, availability: {s.AvailabilityPreference})")
            .ToList();

        var subscriptionIds = customer.Subscriptions.Select(s => s.Id).ToList();

        var upcomingVisits = subscriptionIds.Count == 0
            ? []
            : await db.JobVisits.AsNoTracking()
                .Include(v => v.Property)
                .Where(v => subscriptionIds.Contains(v.CustomerSubscriptionId) && !v.IsDeleted)
                .Where(v => v.ScheduledDate >= DateTime.UtcNow.Date && v.Status != VisitStatus.Cancelled)
                .OrderBy(v => v.ScheduledDate)
                .Take(3)
                .Select(v => $"{v.ScheduledDate:dd MMM yyyy} — {v.AvailabilityWindow} ({v.Status}) at {v.Property.Postcode}")
                .ToListAsync(ct);

        return $"""
            Customer: {customer.User.FirstName} {customer.User.LastName}
            Email: {customer.User.Email}
            Property: {primaryProperty?.Line1}, {primaryProperty?.Postcode} ({primaryProperty?.GardenSize} garden)
            Subscriptions: {(activeSubs.Count > 0 ? string.Join("; ", activeSubs) : "None active")}
            Upcoming visits: {(upcomingVisits.Count > 0 ? string.Join("; ", upcomingVisits) : "None scheduled yet")}
            """;
    }

    private static double EstimateConfidence(string userMessage, string reply)
    {
        if (reply.Contains("not configured", StringComparison.OrdinalIgnoreCase)
            || reply.Contains("having trouble connecting", StringComparison.OrdinalIgnoreCase))
            return 0.3;
        if (userMessage.Length < 5)
            return 0.4;
        return 0.85;
    }

    private static string BuildEscalationReply(string userMessage, bool isCustomer)
    {
        var lower = userMessage.ToLowerInvariant();
        if (lower.Contains("cancel"))
        {
            return "Thanks for getting in touch. I've escalated your cancellation request to our customer service team — someone will follow up with you shortly.";
        }

        if (lower.Contains("annual") || lower.Contains("upgrade") || lower.Contains("plan change") || lower.Contains("switch"))
        {
            return "Thanks for getting in touch. I've escalated your plan change request to our customer service team — someone will follow up with you shortly.";
        }

        if (EscalationKeywords.Any(k => userMessage.Contains(k, StringComparison.OrdinalIgnoreCase)))
        {
            return isCustomer
                ? "Thanks for getting in touch. I've escalated this to our customer service team — someone will follow up with you shortly."
                : "Thanks for your message. I've passed this to our team — someone will follow up with you shortly.";
        }

        return isCustomer
            ? "Thanks for your message. I've escalated this to our customer service team — someone will follow up with you shortly."
            : "Thanks for your message. I've passed this to our team — someone will follow up with you shortly.";
    }
}
