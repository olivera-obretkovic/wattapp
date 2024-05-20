using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using prosumerAppBack.BusinessLogic;
using prosumerAppBack.BusinessLogic.PowerUsageService;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;

namespace prosumerAppBack.DataAccess
{
	public class DeviceRepository: IDeviceRepository
    {
        private readonly DataContext _dbContext;
        private readonly IUserService _userService;

        public DeviceRepository(DataContext dbContext,UserService userService)
        {
            _dbContext = dbContext;
            _userService = userService;
        }
        
        public async Task<Boolean> UpdateDevice(Guid id, string deviceName)
        {
            var updatedDevice = await _dbContext.Devices.FirstOrDefaultAsync(d => d.ID == id);
            if (updatedDevice == null)
            {
                return false;
            }
            
            updatedDevice.DeviceName = deviceName;
            

            _dbContext.Devices.Update(updatedDevice);
            await _dbContext.SaveChangesAsync();

            return true;
        }
        public List<Device> GetDevicesForUser(Guid userID)
        {
            return _dbContext.Devices.Where(d => d.OwnerID == userID).ToList();
        }
        
        public IEnumerable<object> GetDevicesInfoForUser(Guid userID)
        {
            return _dbContext.Devices
                .Where(d => d.OwnerID == userID)
                .Include(d => d.DeviceType)
                .Select(d => new 
                { 
                    d.ID,
                    d.MacAdress,
                    d.DeviceName,
                    DeviceTypeName = d.DeviceType.Name, 
                    ManufacturerID = d.DeviceType.ManufacturerID,
                })
                .Select(joined => new 
                {
                    DeviceId = joined.ID,
                    joined.MacAdress,
                    joined.DeviceTypeName,
                    joined.DeviceName,
                    ManufacturerName = _dbContext.DeviceManufacturers.FirstOrDefault(m => m.ID == joined.ManufacturerID).Name
                })
                .ToArray();
        }

        

        public IEnumerable<DeviceGroup> GetDeviceGroups()
        {
            return _dbContext.DeviceGroups.ToArray();
        }
        public IEnumerable<DeviceManufacturers> GetDeviceManufacturers()
        {
            return _dbContext.DeviceManufacturers.ToArray();
        }

        public IEnumerable<DeviceType> GetDevicesBasedOnGroup(Guid groupID)
        {
            return _dbContext.DeviceTypes.Where(d => d.GroupID == groupID);
        }

        public IEnumerable<DeviceType> GetDevicesBasedOnManufacturer(Guid maunfID)
        {
            return _dbContext.DeviceTypes.Where(d => d.ManufacturerID == maunfID)
                .GroupBy(d => d.Wattage)
                .Select(g => g.First());
        }
        
        public IEnumerable<DeviceType> GetDevicesBasedOnManufacturerAndGroup(Guid maunfID, Guid groupID)
        {
            return _dbContext.DeviceTypes.Where(d => d.ManufacturerID == maunfID && d.GroupID == groupID);
        }

        public async Task<Device> AddDevice(AddDeviceDto addDeviceDto)
        {
            var newDevice = new Device
            {
                ID = Guid.NewGuid(),
                OwnerID = _userService.GetID().Value,
                MacAdress = addDeviceDto.MacAdress,
                DeviceName = addDeviceDto.DeviceName,
                DeviceTypeID = addDeviceDto.DeviceTypeID,
                IsOn = false,
                dsoHasControl = false,
            };

            _dbContext.Devices.Add(newDevice);
            await _dbContext.SaveChangesAsync();
            return newDevice;
        }

        public IEnumerable<ManufacturerDto> GetManufacturersBasedOnGroup(Guid groupID)
        {
            var manufacturers = _dbContext.DeviceTypes
                .Include(dt => dt.Manufacturer)
                .Where(dt => dt.GroupID == groupID)
                .Select(dt => new ManufacturerDto
                {
                    ManufacturerID = dt.Manufacturer.ID,
                    ManufacturerName = dt.Manufacturer.Name
                })
                .Distinct();

            return manufacturers;
        }

        public Task<List<DeviceInfo>> GetDeviceInfoForUser(Guid userID)
        {
            return _dbContext.Devices
                .Include(d => d.DeviceType)
                .ThenInclude(dt => dt.Manufacturer)
                .Where(d => d.OwnerID == userID)
                .Select(d => new DeviceInfo()
                {
                    deviceName = d.DeviceName,
                    deviceId = d.ID,
                    deviceTypeName = d.DeviceType.Name,
                    macAdress = d.MacAdress,
                    manufacturerName = d.DeviceType.Manufacturer.Name,
                })
                .ToListAsync();
        }

        
        public Task<DeviceInfo> GetDeviceInfoForDevice(Guid deviceID)
        {
            return _dbContext.Devices
                .Include(d => d.DeviceType)
                .ThenInclude(dt => dt.Manufacturer)
                .Include(d => d.DeviceType)
                .ThenInclude(dt => dt.Group)
                .Where(d => d.ID == deviceID)
                .Select(d => new DeviceInfo()
                {
                    deviceName = d.DeviceName,
                    deviceId = d.ID,
                    deviceTypeName = d.DeviceType.Name, 
                    macAdress = d.MacAdress,
                    manufacturerName = d.DeviceType.Manufacturer.Name,
                    groupName = d.DeviceType.Group.Name,
                    wattage = d.DeviceType.Wattage
                })
                .FirstOrDefaultAsync();   
        }

        public IEnumerable<DeviceInfoWithType> GetDeviceInfoForAllDevice()
        {
            return _dbContext.Devices
                .Include(d => d.DeviceType)
                .ThenInclude(dt => dt.Group)
                .Select(d => new DeviceInfoWithType()
                {
                    deviceName = d.DeviceName,
                    deviceTypeId = d.ID,
                    deviceTypeName = d.DeviceType.Name,
                    groupName = d.DeviceType.Group.Name,
                })
                .ToList();
        }

        public async Task<DeviceRule> AddDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto)
        {
            var newRule = new DeviceRule
            {
                DeviceID = id,
                TurnOn = deviceRuleDto.TurnOn,
                TurnOnStatus = deviceRuleDto.TurnOnStatus,
                TurnOff = deviceRuleDto.TurnOff,
                TurnOffStatus = deviceRuleDto.TurnOffStatus,
                TurnOnEvery = deviceRuleDto.TurnOnEvery,
                TurnOnEveryStatus = deviceRuleDto.TurnOnEveryStatus,
            };

            _dbContext.DeviceRules.Add(newRule);
            await _dbContext.SaveChangesAsync();
            return newRule;
        }

        public async Task<DeviceRule> UpdateDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto)
        {
            var deviceRuleToBeUpdated = await _dbContext.DeviceRules.FirstOrDefaultAsync(d => d.DeviceID == id);
            if (deviceRuleToBeUpdated == null)
            {
                throw new NullReferenceException("Device id not found");
            }

            deviceRuleToBeUpdated.TurnOn = deviceRuleDto.TurnOn;
            deviceRuleToBeUpdated.TurnOnStatus = deviceRuleDto.TurnOnStatus;
            deviceRuleToBeUpdated.TurnOff = deviceRuleDto.TurnOff;
            deviceRuleToBeUpdated.TurnOffStatus = deviceRuleDto.TurnOffStatus;
            deviceRuleToBeUpdated.TurnOnEvery = deviceRuleDto.TurnOnEvery;
            deviceRuleToBeUpdated.TurnOnEveryStatus = deviceRuleDto.TurnOnEveryStatus;

            _dbContext.DeviceRules.Update(deviceRuleToBeUpdated);
            await _dbContext.SaveChangesAsync();

            return deviceRuleToBeUpdated;
        }

        public async Task<DeviceRequirement> AddDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto)
        {
            var newRequirement = new DeviceRequirement
            {
                DeviceID = id,
                ChargedUpTo = deviceRequirementDto.ChargedUpTo,
                ChargedUpToStatus = deviceRequirementDto.ChargedUpToStatus,
                ChargedUntil = deviceRequirementDto.ChargedUntil,
                ChargedUntilBattery = deviceRequirementDto.ChargedUntilBattery,
                ChargedUntilBatteryStatus = deviceRequirementDto.ChargedUntilBatteryStatus,
                ChargeEveryDay = deviceRequirementDto.ChargeEveryDay,
                ChargeEveryDayStatus = deviceRequirementDto.ChargeEveryDayStatus,
            };

            _dbContext.DeviceRequirements.Add(newRequirement);
            await _dbContext.SaveChangesAsync();
            return newRequirement;
        }

        public async Task<DeviceRequirement> UpdateDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto)
        {
            var deviceRequirementToBeUpdated = await _dbContext.DeviceRequirements.FirstOrDefaultAsync(d => d.DeviceID == id);
            if(deviceRequirementToBeUpdated == null)
            {
                throw new NullReferenceException("Device id not found");
            }

            deviceRequirementToBeUpdated.ChargedUpTo = deviceRequirementDto.ChargedUpTo;
            deviceRequirementToBeUpdated.ChargedUpToStatus = deviceRequirementDto.ChargedUpToStatus;
            deviceRequirementToBeUpdated.ChargedUntil = deviceRequirementDto.ChargedUntil;
            deviceRequirementToBeUpdated.ChargedUntilBattery = deviceRequirementDto.ChargedUntilBattery;
            deviceRequirementToBeUpdated.ChargedUntilBatteryStatus = deviceRequirementDto.ChargedUntilBatteryStatus;
            deviceRequirementToBeUpdated.ChargeEveryDay = deviceRequirementDto.ChargeEveryDay;
            deviceRequirementToBeUpdated.ChargeEveryDayStatus = deviceRequirementDto.ChargeEveryDayStatus;

            _dbContext.DeviceRequirements.Update(deviceRequirementToBeUpdated);
            await _dbContext.SaveChangesAsync();

            return deviceRequirementToBeUpdated;
        }

        public async Task<bool> DeleteDevice(Guid deviceID)
        {
            var device = _dbContext.Devices.FirstOrDefaultAsync(d => d.ID == deviceID);

            if (device.Result != null)
            {
                _dbContext.Devices.Remove(device.Result);
                await _dbContext.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<bool> UpdateDeviceState(DeviceStateDto deviceStateDto)
        {
            var device = await _dbContext.Devices.FirstOrDefaultAsync(d => d.ID == deviceStateDto.ID);
            device.IsOn = deviceStateDto.IsOn;
            
            _dbContext.Devices.Update(device);
            await _dbContext.SaveChangesAsync();
            return true;

        }

        public Boolean IsDeviceTurnedOn(Guid deviceID)
        {
            var isOn = _dbContext.Devices
                            .Where(d => d.ID.ToString().ToUpper() == deviceID.ToString().ToUpper())
                            .Select(ison => ison.IsOn)
                            .FirstOrDefault();

            return isOn;
        }

         public bool DSOHasControl(Guid deviceID)
         {
            bool sharesWithDSO = _dbContext.Devices
                            .Where(u => u.ID == deviceID)
                            .Select(share => share.dsoHasControl)
                            .FirstOrDefault();

            return sharesWithDSO;
         }

         public  async Task<bool> ChangeState(Guid deviceId)
         {
             var device = await _dbContext.Devices.FirstOrDefaultAsync(d => d.ID == deviceId);

             if (device.IsOn == false)
                 device.IsOn = true;
             else
                 device.IsOn = false;

             _dbContext.Devices.Update(device);
             _dbContext.SaveChangesAsync();

             return true;
         }

        public async Task<Boolean> UpdateUserDeviceDsoControl(Guid deviceID, Boolean dsoHasControl)
        {
            var device = await _dbContext.Devices.FirstOrDefaultAsync(u => u.ID == deviceID);

            device.dsoHasControl = dsoHasControl;

            _dbContext.Devices.Update(device);
            await _dbContext.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<DeviceDto>> GetProducersThatAreNotAttachedToABattery(Guid userID)
        {
            var producers = _dbContext.Devices
                            .Where(u => u.OwnerID == userID)
                            .Include(u => u.DeviceType)
                            .ThenInclude(u => u.Group)
                            .Where(u => u.DeviceType.Group.Name == "Producer")
                            .Select(d => new DeviceDto()
                            {
                                DeviceID = d.ID,
                                DeviceName = d.DeviceName
                            })                            
                            .Except(_dbContext.BatteryConnections.Include(e => e.Device).Select(e => new DeviceDto() 
                            {
                                DeviceID = e.Device.ID,
                                DeviceName = e.Device.DeviceName                                
                            }))                            
                            .ToList();     
                                    
            return producers;
        }

        public async Task<IEnumerable<DeviceDto>> GetConsumersThatAreNotAttachedToABattery(Guid userID)
        {
            var producers = _dbContext.Devices
                            .Where(u => u.OwnerID == userID)
                            .Include(u => u.DeviceType)
                            .ThenInclude(u => u.Group)
                            .Where(u => u.DeviceType.Group.Name == "Consumer")
                            .Select(d => new DeviceDto()
                            {
                                DeviceID = d.ID,
                                DeviceName = d.DeviceName
                            })
                            .Except(_dbContext.BatteryConnections.Include(e => e.Device).Select(e => new DeviceDto()
                            {
                                DeviceID = e.Device.ID,
                                DeviceName = e.Device.DeviceName
                            }))
                            .ToList();

            return producers;
        }

        public async Task<Boolean> AddConnectionToBattery(Guid batteryID, Guid deviceID)
        {
            var device = await _dbContext.Devices.FindAsync(deviceID);
            var deviceCheck = await _dbContext.BatteryConnections.FirstOrDefaultAsync(d => d.Device.ID == deviceID);
            if (deviceCheck != null)
            {
                return false;
            }
            
            Guid deviceTypeID = _dbContext.Devices
               .Where(d => d.ID == batteryID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dbContext.DeviceGroups
                .Where(g => g.ID == _dbContext.DeviceTypes
                    .Where(dt => dt.ID == deviceTypeID)
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();
            if (deviceGroupName == "Storage")
            {
                var newDevice = new BatteryConnections
                {
                    ConnectionID = new Guid(),
                    BatteryID = batteryID,
                    Device = device
                };

                _dbContext.BatteryConnections.Add(newDevice);
                await _dbContext.SaveChangesAsync();
                return true;
            }
            return false;
        }

        public Task<BatteryInfo> GetBatteryInfo(Guid deviceID)
        {
            return _dbContext.Devices
                .Include(d => d.DeviceType)
                .ThenInclude(dt => dt.Manufacturer)
                .Include(d => d.DeviceType)
                .ThenInclude(dt => dt.Group)
                .Where(d => d.ID == deviceID)
                .Select(d => new BatteryInfo()
                {
                    deviceName = d.DeviceName,
                    deviceId = d.ID,
                    deviceTypeName = d.DeviceType.Name,
                    macAdress = d.MacAdress,
                    manufacturerName = d.DeviceType.Manufacturer.Name,
                    groupName = d.DeviceType.Group.Name,
                    capacity = d.DeviceType.Wattage
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<DeviceInfo>> GetDevicesConnectedToBattery(Guid batteryID)
        {
            var info = _dbContext.BatteryConnections
                .Where(e => e.BatteryID == batteryID)
                .Include(e => e.Device)
                .Select(d => new DeviceInfo()
                {
                    deviceName = d.Device.DeviceName,
                    deviceId = d.Device.ID,
                    deviceTypeName = d.Device.DeviceType.Name,
                    macAdress = d.Device.MacAdress,
                    manufacturerName = d.Device.DeviceType.Manufacturer.Name,
                    groupName = d.Device.DeviceType.Group.Name,
                    wattage = d.Device.DeviceType.Wattage
                })
                .ToList();

            return info;
        }
    }

    public class DeviceInfo
    {
        public Guid deviceId { get; set; }
        public string deviceTypeName { get; set; }
        public string macAdress { get; set; }
        public string manufacturerName { get; set; }       
        public string groupName { get; set; }
        public string deviceName { get; set; }
        public double wattage { get; set; }
    }

    public class BatteryInfo
    {
        public Guid deviceId { get; set; }
        public string deviceTypeName { get; set; }
        public string macAdress { get; set; }
        public string manufacturerName { get; set; }
        public string groupName { get; set; }
        public string deviceName { get; set; }
        public double capacity { get; set; }
    }


    public class DeviceInfoWithType
    {
        public string deviceName { get; set; }
        public Guid deviceTypeId { get; set; }
        public string deviceTypeName { get; set; }
        public string groupName { get; set; }
    }

    public class ManufacturerDto
    {
        public Guid ManufacturerID { get; set; }
        public string ManufacturerName { get; set; }
    }
    public class DeviceDto
    {
        public Guid DeviceID { get; set; }
        public string DeviceName { get; set; }
    }
}

