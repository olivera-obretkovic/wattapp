using Microsoft.AspNetCore.Mvc;
using prosumerAppBack.DataAccess;
using prosumerAppBack.Models.Device;

namespace prosumerAppBack.BusinessLogic.DeviceService;

public interface IDeviceService
{
    IEnumerable<Device> GetDevicesForUser(Guid userID);
    Task<Boolean> UpdateDevice(Guid id, string deviceName);
    Task<Device> AddDevice(AddDeviceDto addDeviceDto);
    IEnumerable<object> GetDevicesInfoForUser(Guid userID);
    IEnumerable<DeviceGroup> GetDeviceGroups();
    IEnumerable<DeviceManufacturers> GetDeviceManufacturers();
    IEnumerable<DeviceType> GetDevicesBasedOnGroup(Guid groupID);
    IEnumerable<ManufacturerDto> GetManufacturersBasedOnGroup(Guid groupID);
    IEnumerable<DeviceType> GetDevicesBasedOnManufacturer(Guid maunfID);
    IEnumerable<DeviceType> GetDevicesBasedOnManufacturerAndGroup(Guid maunfID, Guid groupID);
    Task<List<DeviceInfo>> GetDeviceInfoForUser(Guid userID);    
    Task<DeviceInfo> GetDeviceInfoForDevice(Guid deviceID);
    IEnumerable<DeviceInfoWithType> GetDeviceInfoForAllDevice();
    Task<DeviceRule> UpdateDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto);
    Task<DeviceRule> AddDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto);
    Task<DeviceRequirement> UpdateDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto);
    Task<DeviceRequirement> AddDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto);
    Task<bool> DeleteDevice(Guid deviceID);
    Task<bool> UpdateDeviceState(DeviceStateDto deviceStateDto);
    public Boolean IsDeviceTurnedOn(Guid deviceID);
    public bool DSOHasControl(Guid deviceID);
    public Task<bool> ChangeState(Guid deviceId);
    Task<Boolean> UpdateUserDeviceDsoControl(Guid deviceID, Boolean dsoHasControl);
    Task<IEnumerable<DeviceDto>> GetProducersThatAreNotAttachedToABattery(Guid userID);
    Task<IEnumerable<DeviceDto>> GetConsumersThatAreNotAttachedToABattery(Guid userID);
    Task<Boolean> AddConnectionToBattery(Guid batteryID, Guid deviceID);
    Task<BatteryInfo> GetBatteryInfo(Guid batteryID);
    Task<IEnumerable<DeviceInfo>> GetDevicesConnectedToBattery(Guid batteryID);
}