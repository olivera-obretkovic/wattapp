using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Device
{
    public class BatteryConnections
    {
        [Key]
        public Guid ConnectionID { get; set; }
        public Guid BatteryID { get; set; }
        public Device Device { get; set; }

    }
}
