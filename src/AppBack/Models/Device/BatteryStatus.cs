using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Device
{
    public class BatteryStatus
    {        
        public Guid ID { get; set; }
        [Key]
        public DateTime Date { get; set; }
        public double BatteryPercent { get; set; }
    }
}
