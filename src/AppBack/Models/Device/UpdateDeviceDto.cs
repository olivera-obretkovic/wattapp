namespace prosumerAppBack.Models.Device
{
    public class UpdateDeviceDto
    {
        public string? DeviceName { get; set; }
        public string? Manufacturer { get; set; }
        public double Wattage { get; set; }
        public double UsageFrequency { get; set; }
        public string? MacAdress { get; set; }
        public int DeviceAge { get; set; }
        public Boolean IsOn { get; set; }
        public Boolean dsoHasControl { get; set; }
    }
}
