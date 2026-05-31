using Sorted.Core.Enums;
using Sorted.Core.Plans;
using Xunit;

namespace Sorted.Core.Tests;

public class GardenSizeBandsTests
{
    [Theory]
    [InlineData(GardenSize.Small, 50)]
    [InlineData(GardenSize.Medium, 100)]
    [InlineData(GardenSize.Large, 150)]
    public void Max_maintained_area_sqm(GardenSize size, int expected) =>
        Assert.Equal(expected, GardenSizeBands.MaxMaintainedAreaSqm(size));

    [Theory]
    [InlineData(GardenSize.Small, 20.00, 70)]
    [InlineData(GardenSize.Medium, 30.00, 100)]
    [InlineData(GardenSize.Large, 40.00, 130)]
    public void Provider_pay_and_slot_minutes(GardenSize size, decimal pay, int slotMinutes)
    {
        Assert.Equal(pay, ProviderVisitPay.ForGardenSize(size));
        Assert.Equal(slotMinutes, GardenSizeBands.TargetSlotMinutesWithTravel(size));
    }
}
