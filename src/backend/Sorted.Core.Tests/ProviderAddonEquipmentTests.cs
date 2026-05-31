using Sorted.Core.Plans;

namespace Sorted.Core.Tests;

public class ProviderAddonEquipmentTests
{
    [Fact]
    public void Defines_three_addon_equipment_items()
    {
        Assert.Equal(3, ProviderAddonEquipmentRequirements.Items.Count);
        Assert.Contains(
            ProviderAddonEquipmentRequirements.Items,
            i => i.Key == ProviderAddonEquipmentRequirements.LeafBlowerKey);
    }
}
