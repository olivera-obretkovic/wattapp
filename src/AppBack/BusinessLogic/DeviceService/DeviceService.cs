using Microsoft.AspNetCore.Mvc;
using prosumerAppBack.DataAccess;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;
using SendGrid.Helpers.Errors.Model;
using System.Runtime.CompilerServices;
using System.Text.RegularExpressions;

namespace prosumerAppBack.BusinessLogic.DeviceService;

public class DeviceService:IDeviceService
{
    private readonly IDeviceRepository _repository;

    public DeviceService(IDeviceRepository repository)
    {
        _repository = repository;
    }
    public IEnumerable<Device> GetDevicesForUser(Guid userID)
    {
        var devices = _repository.GetDevicesForUser(userID);
        if (devices == null)
        {
            throw new NotFoundException();
        }
        return devices;
    }
    public async Task<Boolean> UpdateDevice(Guid id, string deviceName)
    {
        if(id == null)
        {
            throw new NullReferenceException("device not found");
        }
        if (deviceName == null)
        {
            throw new NullReferenceException("device name required");
        }
        var check = await _repository.UpdateDevice(id, deviceName);
        if (!check)
        {
            throw new NotFoundException("device not updated");
        }
        return check;
    }
    public async Task<Device> AddDevice(AddDeviceDto addDeviceDto)
    {
        if (addDeviceDto == null)
        {
            throw new NullReferenceException("device info required");
        }
        var check = await _repository.AddDevice(addDeviceDto);
        if (check == null)
        {
            throw new NotFoundException("device not added");
        }
        return check;
    }

    public IEnumerable<object> GetDevicesInfoForUser(Guid userID)
    {
        var check = _repository.GetDevicesInfoForUser(userID);
        if (check == null)
        {
            throw new NotFoundException("User doesn't have any devices");
        }
        return check;
    }


    public IEnumerable<DeviceGroup> GetDeviceGroups()
    {
        var check = _repository.GetDeviceGroups();
        if (check == null)
        {
            throw new NotFoundException("No device group found");
        }
        return check;
    }

    public IEnumerable<DeviceManufacturers> GetDeviceManufacturers()
    {
        var check = _repository.GetDeviceManufacturers();
        if (check == null)
        {
            throw new NotFoundException("No device manufacturers found");
        }
        return check;
    }

    public IEnumerable<DeviceType> GetDevicesBasedOnGroup(Guid groupID)
    {
        var check = _repository.GetDevicesBasedOnGroup(groupID);
        if (check == null)
        {
            throw new NotFoundException("No devices of this group were found");
        }
        return check;
    }

    public IEnumerable<ManufacturerDto> GetManufacturersBasedOnGroup(Guid groupID)
    {
        var check = _repository.GetManufacturersBasedOnGroup(groupID);
        if (check == null)
        {
            throw new NotFoundException("No manufacturers of this device group were found");
        }
        return check;
    }

    public IEnumerable<DeviceType> GetDevicesBasedOnManufacturer(Guid maunfID)
    {
        var check = _repository.GetDevicesBasedOnManufacturer(maunfID);
        if (check == null)
        {
            throw new NotFoundException("No devices of this manufacturer were found");
        }
        return check;
    }

    public IEnumerable<DeviceType> GetDevicesBasedOnManufacturerAndGroup(Guid maunfID, Guid groupID)
    {
        var check = _repository.GetDevicesBasedOnManufacturerAndGroup(maunfID, groupID);
        if (check == null)
        {
            throw new NotFoundException("No devices of this manufacturer and device group were found");
        }
        return check;
    }

    public Task<List<DeviceInfo>> GetDeviceInfoForUser(Guid userID)
    {
        var check = _repository.GetDeviceInfoForUser(userID);
        if (check == null)
        {
            throw new NotFoundException("User has no devices.");
        }
        return check;
    }

    public Task<DeviceInfo> GetDeviceInfoForDevice(Guid deviceID)
    {
        var check = _repository.GetDeviceInfoForDevice(deviceID);
        if (check == null)
        {
            throw new NotFoundException("No device with given ID");
        }
        return check;
    }

    public IEnumerable<DeviceInfoWithType> GetDeviceInfoForAllDevice()
    {
        var check = _repository.GetDeviceInfoForAllDevice();
        if (check == null)
        {
            throw new NotFoundException("No devices found");
        }
        return check;
    }


    public Task<DeviceRule> AddDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto)
    {
        if (deviceRuleDto == null)
        {
            throw new NullReferenceException("Device rule can't be null");
        }
        var check = _repository.AddDeviceRule(id, deviceRuleDto);
        if (check == null)
        {
            throw new NotFoundException("Device rule not added");
        }
        return check;
    }

    public Task<DeviceRule> UpdateDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto)
    {
        if (deviceRuleDto == null)
        {
            throw new NullReferenceException("Device rule can't be null");
        }
        var check = _repository.UpdateDeviceRule(id, deviceRuleDto);
        if (check == null)
        {
            throw new NotFoundException("Device rule not updated");
        }
        return check;
    }

    public Task<DeviceRequirement> AddDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto)
    {
        if (deviceRequirementDto == null)
        {
            throw new NullReferenceException("Device requirement can't be null");
        }
        var check = _repository.AddDeviceRequirement(id, deviceRequirementDto);
        if (check == null)
        {
            throw new NotFoundException("Device requirement not added");
        }
        return check;
    }

    public Task<DeviceRequirement> UpdateDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto)
    {
        if (deviceRequirementDto == null)
        {
            throw new NullReferenceException("Device requirement can't be null");
        }
        var check = _repository.UpdateDeviceRequirement(id, deviceRequirementDto);
        if (check == null)
        {
            throw new NotFoundException("Device requirement not updated");
        }
        return check;
    }
    public async Task<bool> DeleteDevice(Guid deviceID)
    {
        try
        {
            return await _repository.DeleteDevice(deviceID);
        }
        catch(Exception ex)
        {
            throw new Exception("Failed to delete device: " + ex.Message);
        }
    }

    public async Task<bool> UpdateDeviceState(DeviceStateDto deviceStateDto)
    {
        try
        {
            return await _repository.UpdateDeviceState(deviceStateDto);
        }
        catch (Exception ex)
        {
            throw new Exception("Failed to update device state: " + ex.Message);
        }
    }

    public Boolean IsDeviceTurnedOn(Guid deviceID)
    {
        return _repository.IsDeviceTurnedOn(deviceID);
    }

    public bool DSOHasControl(Guid deviceID)
    {
        return _repository.DSOHasControl(deviceID);
    }

    public Task<bool> ChangeState(Guid deviceId)
    {
        return _repository.ChangeState(deviceId);
    }

    public async Task<Boolean> UpdateUserDeviceDsoControl(Guid deviceID, Boolean dsoHasControl)
    {
        var action = await _repository.UpdateUserDeviceDsoControl(deviceID, dsoHasControl);
        if (!action)
        {
            throw new BadRequestException("Device dso control consumption time permission has failed to update");
        }
        return true;
    }

    public async Task<IEnumerable<DeviceDto>> GetProducersThatAreNotAttachedToABattery(Guid userID)
    {
        var producers = await _repository.GetProducersThatAreNotAttachedToABattery(userID);
        if (producers == null)
        {
            throw new NotFoundException();
        }
        return producers;
    }

    public async Task<IEnumerable<DeviceDto>> GetConsumersThatAreNotAttachedToABattery(Guid userID)
    {
        var producers = await _repository.GetConsumersThatAreNotAttachedToABattery(userID);
        if (producers == null)
        {
            throw new NotFoundException();
        }
        return producers;
    }

    public async Task<Boolean> AddConnectionToBattery(Guid batteryID, Guid deviceID)
    {
        var producers = await _repository.AddConnectionToBattery(batteryID, deviceID);
        if (producers == false)
        {
            throw new BadRequestException("device is already connected to battery");
        }
        return true;
    }

    public Task<BatteryInfo> GetBatteryInfo(Guid batteryID)
    {
        var check = _repository.GetBatteryInfo(batteryID);
        if (check == null)
        {
            throw new NotFoundException("No battery with given ID");
        }
        return check;
    }

    public Task<IEnumerable<DeviceInfo>> GetDevicesConnectedToBattery(Guid batteryID)
    {
        var check = _repository.GetDevicesConnectedToBattery(batteryID);        
        return check;
    }
}