using System;
using System.Data;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using prosumerAppBack.BusinessLogic;
using prosumerAppBack.BusinessLogic.DeviceService;
using prosumerAppBack.DataAccess;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;

namespace prosumerAppBack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
    public class DeviceController : ControllerBase
    {
        private readonly IDeviceService _deviceService;
        private readonly IUserService _userService;
        public DeviceController(IDeviceService deviceService, IUserService userService)
        {
            _deviceService = deviceService;
            _userService = userService;
        }

        [HttpPut("update/{id}")]
        // [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> UpdateDevice(Guid id, [FromBody] string deviceName)
        {
            try
            {
                var check = await _deviceService.UpdateDevice(id, deviceName);

                return Ok(new { message = "Device updated" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }
        [HttpPost("devices/add-new")]
        // [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> AddDevice([FromBody] AddDeviceDto addDeviceDto)
        {
            try
            {
                var check = await _deviceService.AddDevice(addDeviceDto);

                return Ok(new { message = "Device added" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }
        [HttpGet("devices/{userID}")]
        // [Authorize(Roles = "Dispatcher,Admin")]
        public IActionResult GetDevicesForUser(Guid userID)
        {
            try
            {
                var devices = _deviceService.GetDevicesForUser(userID);

                return Ok(devices);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }
        [HttpGet("devices/info")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetDevicesInfoForUser()
        {
            try
            {
                var devices = _deviceService.GetDevicesInfoForUser(_userService.GetID().Value);

                return Ok(devices);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("devices/deviceType-info")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetDeviceInfoForAllDevice()
        {
            try
            {
                var devices = _deviceService.GetDeviceInfoForAllDevice();
                return Ok(devices);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("devices/info/user/{userID}")]
        // [Authorize(Roles = "Dispatcher,Admin")]
        public IActionResult GetDevicesInfoForUser(Guid userID)
        {
            try
            {
                var devices = _deviceService.GetDeviceInfoForUser(userID);
                return Ok(devices.Result);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("devices/info/{deviceID}")]
        // [Authorize(Roles = "Dispatcher,Admin")]
        public IActionResult GetDevicesInfo(Guid deviceID)
        {
            try
            {
                var device = _deviceService.GetDeviceInfoForDevice(deviceID);
                return Ok(device.Result);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }

        }

        [HttpGet("groups")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetGroups()
        {
            try
            {
                var groups = _deviceService.GetDeviceGroups();

                return Ok(groups);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }
        [HttpGet("manufacturers")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetManufacturers()
        {
            try
            {
                var manufacturers = _deviceService.GetDeviceManufacturers();

                return Ok(manufacturers);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("manufacturers/{groupID}")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetDeviceManufacturersBasedOnGroup(Guid groupID)
        {
            try
            {
                var manufacturers = _deviceService.GetManufacturersBasedOnGroup(groupID);

                return Ok(manufacturers);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("manufacturer/{manID}")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetDevicesBasedOnManufacturer(Guid manID)
        {
            try
            {
                var manufacturers = _deviceService.GetDevicesBasedOnManufacturer(manID);

                return Ok(manufacturers);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("groups/{groupID}")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetDeviceTypesGroup(Guid groupID)
        {
            try
            {
                var groups = _deviceService.GetDevicesBasedOnGroup(groupID);

                return Ok(groups);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("{groupID}/{manufID}")]
        // [Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
        public IActionResult GetDeviceTypesGroup(Guid groupID, Guid manufID)
        {
            try
            {
                var list = _deviceService.GetDevicesBasedOnManufacturerAndGroup(manufID, groupID);

                return Ok(list);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }
        [HttpDelete("delete-device/{deviceID}")]
        // [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> DeleteDevice(Guid deviceID)
        {
            var action = await _deviceService.DeleteDevice(deviceID);
            if (!action)
            {
                return BadRequest("device cannot be deleted");
            }

            return Ok(new { Message = "device deleted successfully" });
        }

        [HttpPost("add-rule/{id}")]
        //  [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> AddDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto)
        {
            try
            {
                var check = await _deviceService.AddDeviceRule(id, deviceRuleDto);

                return Ok(new { message = "Device rule added" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpPut("update-rule/{id}")]
        //  [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> UpdateDeviceRule(Guid id, [FromBody] DeviceRuleDto deviceRuleDto)
        {
            try
            {
                var check = await _deviceService.UpdateDeviceRule(id, deviceRuleDto);

                return Ok(new { message = "Device rule updated" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpPost("add-requirement/{id}")]
        // [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> AddDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto)
        {
            try
            {
                var check = await _deviceService.AddDeviceRequirement(id, deviceRequirementDto);

                return Ok(new { message = "Device requirement added" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpPut("update-requirement/{id}")]
        // [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> UpdateDeviceRequirement(Guid id, [FromBody] DeviceRequirementDto deviceRequirementDto)
        {
            try
            {
                var check = await _deviceService.UpdateDeviceRequirement(id, deviceRequirementDto);

                return Ok(new { message = "Device requirement updated" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpPost("update-device-state")]
        //  [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public async Task<IActionResult> UpdateDeviceState([FromBody] DeviceStateDto deviceStateDto)
        {
            try
            {
                var check = await _deviceService.UpdateDeviceState(deviceStateDto);

                return Ok(new { message = "Device state updated" });
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("is-turned-on/{deviceID}")]
        // [Authorize(Roles = "UnapprovedUser,RegularUser")]
        public ActionResult<Boolean> IsDeviceTurnedOn(Guid deviceID)
        {
            var isIt = _deviceService.IsDeviceTurnedOn(deviceID);
            if (isIt == false)
                return false;
            return true;
        }
        
        [HttpGet("change-state/{deviceID}")]
        public ActionResult<Boolean> turnDevice(Guid deviceID)
        {
            var isIt = _deviceService.ChangeState(deviceID);
            return Ok(isIt);
        }

        [HttpGet("DSO-has-control/{deviceID}")]
        public ActionResult<bool> DSOHasControl(Guid deviceID)
        {
            var has = _deviceService.DSOHasControl(deviceID);

            return has;
        }

        [HttpPut("update-device-dso-control-permission/{deviceID}")]
        public async Task<IActionResult> UpdateUserDeviceDsoControl(Guid deviceID, [FromBody] Boolean dsoHasControl)
        {
            try
            {
                var result = await _deviceService.UpdateUserDeviceDsoControl(deviceID, dsoHasControl);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("get-producers-that-are-not-connected-to-battery/{userID}")]
        public async Task<IActionResult> GetProducersThatAreNotAttachedToABattery(Guid userID)
        {
            try
            {
                var devices = await _deviceService.GetProducersThatAreNotAttachedToABattery(userID);

                return Ok(devices);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("get-consumers-that-are-not-connected-to-battery/{userID}")]
        public async Task<IActionResult> GetConsumersThatAreNotAttachedToABattery(Guid userID)
        {
            try
            {
                var devices = await _deviceService.GetConsumersThatAreNotAttachedToABattery(userID);

                return Ok(devices);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpPost("add-connection-to-battery/{batteryID}")]
        public async Task<IActionResult> AddConnectionToBattery(Guid batteryID, [FromBody] Guid deviceID)
        {
            try
            {
                var devices = await _deviceService.AddConnectionToBattery(batteryID, deviceID);

                return Ok(devices);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("get-battery-info/{batteryID}")]
        public async Task<IActionResult> GetBatteryInfo(Guid batteryID)
        {
            try
            {
                var battery = await _deviceService.GetBatteryInfo(batteryID);

                return Ok(battery);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }

        [HttpGet("get-connected-devices-info/{batteryID}")]
        public async Task<IActionResult> GetDevicesConnectedToBattery(Guid batteryID)
        {
            try
            {
                var battery = await _deviceService.GetDevicesConnectedToBattery(batteryID);

                return Ok(battery);
            }
            catch (ArgumentNullException ex)
            {
                throw new ArgumentException(ex.Message);
            }
        }
    }
}

