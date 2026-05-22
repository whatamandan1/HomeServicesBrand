using System.Text.Json;
using Sorted.Core.Entities;
using Sorted.Core.Interfaces;
using Sorted.Infrastructure.Data;

namespace Sorted.Infrastructure.Services;

public class WorkflowLogger(SortedDbContext db) : IWorkflowLogger
{
    public async Task LogAsync(string workflowName, string eventName, string? entityType, Guid? entityId, object? payload = null, CancellationToken ct = default)
    {
        db.WorkflowEvents.Add(new WorkflowEvent
        {
            WorkflowName = workflowName,
            EventName = eventName,
            EntityType = entityType,
            EntityId = entityId,
            PayloadJson = payload is null ? "{}" : JsonSerializer.Serialize(payload)
        });
        await db.SaveChangesAsync(ct);
    }
}
