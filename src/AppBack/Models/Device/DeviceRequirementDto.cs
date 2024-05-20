namespace prosumerAppBack.Models.Device
{
    public class DeviceRequirementDto
    {
        public int ChargedUpTo { get; set; }
        public Boolean ChargedUpToStatus { get; set; }
        public string ChargedUntil { get; set; }
        public int ChargedUntilBattery { get; set; }
        public Boolean ChargedUntilBatteryStatus { get; set; }
        public string ChargeEveryDay { get; set; }
        public Boolean ChargeEveryDayStatus { get; set; }
    }
}
