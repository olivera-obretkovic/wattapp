using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

namespace prosumerAppBack.Models.Device
{
    public class DeviceRule
    {        
        [Key]
        public Guid DeviceID { get; set; }
        public string TurnOn { get; set; }
        public Boolean TurnOnStatus { get; set; }
        public string TurnOff { get; set; }
        public Boolean TurnOffStatus { get; set; }
        public string TurnOnEvery { get; set; }
        public Boolean TurnOnEveryStatus { get; set; }

    }
}
