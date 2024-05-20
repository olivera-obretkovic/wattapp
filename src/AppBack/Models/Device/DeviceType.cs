using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace prosumerAppBack.Models.Device;

public class DeviceType
{
    [Key]
    public Guid ID { get; set; }
    
    public string Name { get; set; }
    
    public Guid GroupID { get; set; }
    [ForeignKey("GroupID")]
    public DeviceGroup Group { get; set; }
    
    public Guid ManufacturerID { get; set; }
    [ForeignKey("ManufacturerID")]
    public DeviceManufacturers Manufacturer { get; set; }
    
    public double Wattage { get; set; }
    
    public ICollection<Device> Devices { get; set; }
}