using Sorted.Core.Dtos;
using Sorted.Core.Entities;

namespace Sorted.Infrastructure.Mapping;

public static class JobVisitResponseMapper
{
    public static JobVisitResponse FromEntity(JobVisit visit, string? assignedProviderName = null) =>
        new(
            visit.Id,
            visit.ScheduledDate,
            visit.AvailabilityWindow,
            visit.Status,
            visit.Property.Postcode,
            assignedProviderName
            ?? (visit.AssignedProvider is null
                ? null
                : visit.AssignedProvider.User.FirstName + " " + visit.AssignedProvider.User.LastName),
            visit.Property.Latitude,
            visit.Property.Longitude);
}
