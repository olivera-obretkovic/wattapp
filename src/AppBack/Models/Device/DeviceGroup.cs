using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Device;

public class DeviceGroup
{
    [Key]
    public Guid ID { get; set; }
    public String Name { get; set; }
    
    public ICollection<DeviceType> DeviceTypes { get; set; }
}