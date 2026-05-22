using Microsoft.EntityFrameworkCore;
using OpenAI.Chat;
using Sorted.Core.Dtos;
using Sorted.Core.Entities;
using Sorted.Core.Enums;
using Sorted.Core.Interfaces;
using Sorted.Core.Options;
using Sorted.Infrastructure.Data;
using Microsoft.Extensions.Options;

namespace Sorted.Infrastructure.Services;

public class OpenAiSupportService(SortedDbContext db, IOptions<OpenAiOptions> options) : IAiSupportService
{
    private const double EscalationThreshold = 0.55;
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

        var reply = await GenerateReplyAsync(request.Message, ct);
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

    private async Task<string> GenerateReplyAsync(string userMessage, CancellationToken ct)
    {
        var apiKey = options.Value.ApiKey;
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return "Thanks for your message. Our team will follow up shortly. (OpenAI not configured — dev fallback.)";
        }

        var client = new ChatClient(options.Value.Model, apiKey);
        var completion = await client.CompleteChatAsync(
        [
            new SystemChatMessage(
                "You are GardensSorted customer support for a Yorkshire UK gardening subscription service. " +
                "Be brief, friendly, and factual. Do not promise refunds or cancellations — say a human will help. " +
                "Topics: visit windows, subscription plans, property access, billing questions."),
            new UserChatMessage(userMessage)
        ], cancellationToken: ct);

        return completion.Value.Content[0].Text ?? "I could not generate a response.";
    }

    private static double EstimateConfidence(string userMessage, string reply)
    {
        if (reply.Contains("not configured", StringComparison.OrdinalIgnoreCase))
            return 0.3;
        if (userMessage.Length < 5)
            return 0.4;
        return 0.85;
    }
}
