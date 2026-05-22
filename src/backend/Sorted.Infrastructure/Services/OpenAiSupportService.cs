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

namespace Sorted.Infrastructure.Services;

public class OpenAiSupportService(
    SortedDbContext db,
    IOptions<OpenAiOptions> options,
    ILogger<OpenAiSupportService> logger) : IAiSupportService
{
    private const double EscalationThreshold = 0.55;
    private const int MaxHistoryMessages = 20;
    private static readonly string[] EscalationKeywords = ["cancel", "refund", "complaint", "dispute", "angry", "broken", "urgent"];

    public async Task<SupportChatResponse> ChatAsync(Guid customerId, SupportChatRequest request, CancellationToken ct = default)
    {
        var thread = request.ThreadId.HasValue
            ? await db.CommunicationThreads.Include(t => t.Messages).FirstOrDefaultAsync(t => t.Id == request.ThreadId && t.CustomerId == customerId, ct)
            : null;

        if (thread is null)
        {
            thread = new CommunicationThread { CustomerId = customerId, Subject = "Support chat" };
            db.CommunicationThreads.Add(thread);
            await db.SaveChangesAsync(ct);
        }

        db.Messages.Add(new Message { ThreadId = thread.Id, SenderRole = "Customer", Body = request.Message });
        await db.SaveChangesAsync(ct);

        var reply = await GenerateReplyAsync(customerId, thread.Id, ct);
        var confidence = EstimateConfidence(request.Message, reply);
        var shouldEscalate = confidence < EscalationThreshold
            || EscalationKeywords.Any(k => request.Message.Contains(k, StringComparison.OrdinalIgnoreCase));

        if (shouldEscalate)
        {
            db.Escalations.Add(new Escalation
            {
                CustomerId = customerId,
                Reason = $"AI escalation: low confidence or sensitive topic. Message: {request.Message[..Math.Min(200, request.Message.Length)]}",
                Status = EscalationStatus.Open
            });
        }

        db.Messages.Add(new Message { ThreadId = thread.Id, SenderRole = "AI", Body = reply, IsFromAi = true });
        db.AIActionLogs.Add(new AIActionLog
        {
            CustomerId = customerId,
            ActionType = "support_chat",
            PromptSummary = request.Message[..Math.Min(500, request.Message.Length)],
            ResponseSummary = reply[..Math.Min(500, reply.Length)],
            ConfidenceScore = confidence,
            Escalated = shouldEscalate
        });
        await db.SaveChangesAsync(ct);

        return new SupportChatResponse(thread.Id, reply, shouldEscalate, confidence);
    }

    private async Task<string> GenerateReplyAsync(Guid customerId, Guid threadId, CancellationToken ct)
    {
        var apiKey = options.Value.ApiKey;
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

            var context = await BuildCustomerContextAsync(customerId, ct);
            var client = new ChatClient(options.Value.Model, apiKey);

            var chatMessages = new List<ChatMessage>
            {
                new SystemChatMessage(
                    "You are GardensSorted customer support for a Yorkshire UK gardening subscription service. " +
                    "Be brief, friendly, and factual. Use the customer account context when answering about their plan or visits. " +
                    "Do not promise refunds or cancellations — say a human will help for billing disputes. " +
                    "Topics: visit windows, subscription plans, property access, billing questions.\n\n" +
                    context)
            };

            foreach (var msg in history)
            {
                if (msg.SenderRole is "Customer" or "User")
                    chatMessages.Add(new UserChatMessage(msg.Body));
                else
                    chatMessages.Add(new AssistantChatMessage(msg.Body));
            }

            var completion = await client.CompleteChatAsync(chatMessages, cancellationToken: ct);
            return completion.Value.Content[0].Text ?? "I could not generate a response.";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "OpenAI support chat failed for customer {CustomerId}", customerId);
            return "Sorry — I'm having trouble connecting right now. Your message is saved and our team will follow up shortly.";
        }
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

        var upcomingVisits = await db.JobVisits.AsNoTracking()
            .Include(v => v.Property)
            .Where(v => v.Subscription.CustomerId == customerId && !v.IsDeleted)
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
}
