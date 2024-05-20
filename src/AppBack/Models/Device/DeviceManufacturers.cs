using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Device;

public class DeviceManufacturers
{
    [Key]
    public Guid ID { get; set; }
    public String Name { get; set; }
    
    public ICollection<DeviceType> DeviceTypes { get; set; }
}