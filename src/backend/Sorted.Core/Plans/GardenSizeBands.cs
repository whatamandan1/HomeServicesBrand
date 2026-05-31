using Sorted.Core.Enums;

namespace Sorted.Core.Plans;

/// <summary>
/// Garden-size band metadata (area, visit duration). Prices in <see cref="GardenSizePricing"/>.
/// </summary>
public static class GardenSizeBands
{
    public const string MaintainedAreaDefinition =
        "Lawn, planted beds, and edges we cut and tidy on each visit - not your whole plot, large paving, or areas out of scope.";

    public const int TravelMinutesPerVisit = 10;

    public static int MaxMaintainedAreaSqm(GardenSize gardenSize) =>
        GardenSizePricing.MaxMaintainedAreaSqm(gardenSize);

    public static int TargetOnSiteMinutesEssential(GardenSize gardenSize) =>
        GardenSizePricing.TargetOnSiteMinutes(gardenSize);

    public static int TargetSlotMinutesWithTravel(GardenSize gardenSize) =>
        TargetOnSiteMinutesEssential(gardenSize) + TravelMinutesPerVisit;
}
