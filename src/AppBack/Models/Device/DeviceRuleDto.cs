using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Device
{
    public class DeviceRuleDto
    {     
        public string TurnOn { get; set; }
        public Boolean TurnOnStatus { get; set; }
        public string TurnOff { get; set; }
        public Boolean TurnOffStatus { get; set; }
        public string TurnOnEvery { get; set; }
        public Boolean TurnOnEveryStatus { get; set; }
    }
}
