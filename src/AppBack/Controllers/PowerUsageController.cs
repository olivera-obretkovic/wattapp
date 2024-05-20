using System;
using System.Collections.Generic;
using System.Data;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using prosumerAppBack.BusinessLogic;
using prosumerAppBack.BusinessLogic.PowerUsageService;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;
namespace prosumerAppBack.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Dispatcher,Admin,UnapprovedUser,RegularUser")]
public class PowerUsageController : ControllerBase
{
    private readonly IPowerUsageService _powerUsageService;
    private readonly IPowerUsageRepository _powerUsage;

    public PowerUsageController(IPowerUsageService powerUsageService, IPowerUsageRepository powerUsage)
    {
        _powerUsageService = powerUsageService;
        _powerUsage = powerUsage;
    }
  
    [HttpGet("power-usage/current/device/{deviceID}")]
    public async Task<ActionResult<double>> GetForDevice(Guid deviceID)
    {        
        var powerUsages = await _powerUsageService.GetForDevice(deviceID);

        if (powerUsages == -1)
            return BadRequest("Device does not exists");
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/7daysHistory/device/{deviceID}")]
    public async Task<ActionResult<IEnumerable<PowerUsage>>> GetPowerUsageFor7DaysHistory(Guid deviceID)
    {        
        try
        {
            var powerUsages = _powerUsageService.GetPowerUsageFor7Days(deviceID, -1);

            return Ok(powerUsages.Result);
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }
    
    [HttpGet("power-usage/7daysFuture/device/{deviceID}")]
    public ActionResult<IEnumerable<PowerUsage>> GetPowerUsageFor7DaysFuture(Guid deviceID)
    {        
        try
        {
            var powerUsages = _powerUsageService.GetPowerUsageFor7Days(deviceID, 1);

            return Ok(powerUsages.Result);
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    [HttpGet("power-usage/MonthFuture/device/{deviceID}")]
    public async Task<ActionResult<IEnumerable<PowerUsage>>> GetPowerUsageForAMonthFuture(Guid deviceID)
    {
            var powerUsages = await _powerUsageService.GetPowerUsageForAMonth(deviceID, 1);

            return Ok(powerUsages);
    }

    [HttpGet("power-usage/MonthPast/device/{deviceID}")]
    public ActionResult<IEnumerable<PowerUsage>> GetPowerUsageForAMonthPast(Guid deviceID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForAMonth(deviceID, -1);

        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/Previous24h/device-usage_per_hour/{deviceID}")]
    public async Task<ActionResult<PowerUsage>> GetDeviceUsageForPrev24(Guid deviceID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicePast24Hours(deviceID, - 1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/Next24h/device-usage_per_hour/{deviceID}")]
    public async Task<ActionResult<PowerUsage>> GetDeviceUsageForNext24(Guid deviceID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicePast24Hours(deviceID, 1);
        return Ok(powerUsages);
    }
    
    
    [HttpGet("power-usage/today/currentPowerUsage/{deviceID}")]
    public async Task<IActionResult> GetDeviceDataHourToday(Guid deviceID)
    {
        var powerUsages = await _powerUsageService.GetForDeviceByHour(deviceID);
        return Ok(powerUsages);
    }    

    [HttpGet("power-usage/current-consumption/system")]
    [Authorize(Roles = "Dispatcher,Admin")]
    public async Task<ActionResult<double>> GetForSystemConsumer()
    {        
            var powerUsages = await _powerUsageService.CurrentSumPowerUsageSystemConsumer();

            return Ok(powerUsages);
    }

    [HttpGet("power-usage/current-production/system")]
    [Authorize(Roles = "Dispatcher,Admin")]
    public async Task<ActionResult<double>> CurrentSumPowerUsageSystemProducer()
    {
            var powerUsages = await _powerUsageService.CurrentSumPowerUsageSystemProducer();

            return Ok(powerUsages);
    }

    [HttpGet("power-usage/currentUsageUser/average-production/{userID}")]
    public async Task<ActionResult<double>> GetForUserProduction(Guid userID)
    {
        try
        {
            var powerUsages = _powerUsageService.AverageSumPowerUsageProduction(userID);

            return Ok(powerUsages.Result);
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    [HttpGet("power-usage/currentUsageUser/average-consumption/{userID}")]
    public async Task<ActionResult<double>> GetForUserConsumption(Guid userID)
    {
            var powerUsages = _powerUsageService.AverageSumPowerUsageConsumtion(userID);

            return Ok(powerUsages.Result);
    }

     [HttpGet("power-usage/currentUsageUser/consumption-summary/{userID}")]
     public async Task<ActionResult<double>> GetForUserCurrentConsumption(Guid userID)
     {
         try
         {
             var powerUsages = _powerUsageService.CurrentSumPowerUsageConsumption(userID);

             return Ok(powerUsages.Result);
         }
         catch (ArgumentNullException ex)
         {
             throw new ArgumentException(ex.Message);
         }
     }

    [HttpGet("power-usage/currentUsageUser/production-summary/{userID}")]
    public async Task<ActionResult<double>> GetForUserCurrentProduction(Guid userID)
    {
        try
        {
            var powerUsages = _powerUsageService.CurrentSumPowerUsageProduction(userID);

            return Ok(powerUsages.Result);
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    [HttpGet("power-usage/previousMonth/production/system")]
    [Authorize(Roles = "Dispatcher,Admin")]
    public async Task<ActionResult<double>> GetSystemPowerUsageForPreviousMonth()
    {
        var powerUsages = await _powerUsageService.GetPoweUsageForAMonthSystemProducer(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextMonth/production/system")]
    [Authorize(Roles = "Dispatcher,Admin")]
    public async Task<ActionResult<double>> GetSystemPowerUsageForNextMonth()
    {
        var powerUsages = await _powerUsageService.GetPoweUsageForAMonthSystemProducer(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/consumption/system")]
    [Authorize(Roles = "Dispatcher,Admin")]
    public async Task<ActionResult<double>> GetSystemPowerConsumptionForPreviousMonth()
    {
        var powerUsages = await _powerUsageService.GetPoweUsageForAMonthSystemConsumer(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextMonth/consumption/system")]
    [Authorize(Roles = "Dispatcher,Admin")]
    public async Task<ActionResult<double>> GetSystemPowerConsumptionForNextMonth()
    {
        var powerUsages = await _powerUsageService.GetPoweUsageForAMonthSystemConsumer(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/consumption/each-device")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsagesOfEachDevicePreviousMonthConsumption()
    {
        var powerUsages = await _powerUsageService.GetPowerUsageSumByDeviceConsumer(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextMonth/consumption/each-device")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsagesOfEachDeviceNextMonthConsumption()
    {
        var powerUsages = await _powerUsageService.GetPowerUsageSumByDeviceConsumer(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/production/each-device")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsagesOfEachDevicePreviousMonthProduction()
    {
        var powerUsages = await _powerUsageService.GetPowerUsageSumByDeviceProducer(-1);
        return Ok(powerUsages);
    }    

    [HttpGet("power-usage/nextMonth/production/each-device")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsagesOfEachDeviceNextMonthProduction()
    {
        var powerUsages = await _powerUsageService.GetPowerUsageSumByDeviceProducer(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/consumption/every-day-usage/system")]
    public ActionResult<PowerUsage> GetPowerUsagesOfEachDayPrevMonthConsumption()
    {
        var powerUsages = _powerUsageService.GetPowerUsagesForEachDayConsumtionMonth(-1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/nextMonth/consumption/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDayNextMontConsumption()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayConsumtionMonth(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/production/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDayPrevMonthProduction()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayProductionMonth(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextMonth/production/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDayNextMontProduction()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayProductionMonth(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextWeek/consumption/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDayWeekConsumption()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayConsumptionWeek(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousWeek/consumption/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDaypreviousWeekConsumptionMonth()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayConsumptionWeek(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousWeek/production/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDapreviousWeekConsumption()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayProductionWeek(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextWeek/production/every-day-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDayNextWeekConsumption()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayProductionWeek(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/next24h/consumption/every-hour-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOf24h()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayConsumption24h(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previous24h/consumption/every-hour-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDayprevious24h()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayConsumption24h(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previous24h/production/every-hour-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDaprevious24h()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayProduction24h(-1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/next24h/production/every-hour-usage/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsagesOfEachDay24h()
    {
        var powerUsages = await _powerUsageService.GetPowerUsagesForEachDayProduction24h(1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/consumption/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageEachDayOfEachDevicePrevMonthConsumption(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesConsumption(userID, -1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextMonth/consumption/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageEachDayOfEachDeviceNextMonthConsumption(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesConsumption(userID, 1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previousMonth/production/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageEachDayOfEachDevicePrevMonthProduction(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesProduction(userID, -1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/nextMonth/production/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageEachDayOfEachDeviceNextMonthProduction(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesProduction(userID, 1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previous7Days/consumption/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesConsumptionForPrevious7Days(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesConsumptionFor7Days(userID, -1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/next7Days/consumption/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesConsumptionForNext7Days(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesConsumptionFor7Days(userID, 1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previous7Days/production/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesProductionForPrevious7Days(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesProductionFor7Days(userID, -1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/next7Days/production/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesProductionForNext7Days(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesProductionFor7Days(userID, 1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previous24Hours/consumption/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesConsumptionForPrevious24Hours(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesConsumptionFor24Hours(userID, -1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/next24Hours/consumption/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesConsumptionForNext24Hours(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesConsumptionFor24Hours(userID, 1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/previous24Hours/production/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesProductionForPrevious24Hours(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesProductionFor24Hours(userID, -1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/next24Hours/production/user-every-day-device-usage/{userID}")]
    public async Task<ActionResult<List<PowerUsage>>> GetPowerUsageForDevicesProductionForNext24Hours(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageForDevicesProductionFor24Hours(userID, 1,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/currentDay/consumption/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsageForAHourSystemConsumed()
    {
        var powerUsages = await _powerUsage.GetPowerConsumedForADaySystem();
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/currentDay/production/system")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsageForAHourSystemProduced()
    {
        var powerUsages = await _powerUsage.GetPowerProducedForADaySystem();
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/12hours/{deviceID}")]
    public async Task<ActionResult<PowerUsage>> GetPowerUsage12(Guid deviceID)
    {
        var powerUsages = await _powerUsageService.GetPowerUsageFor12HoursUpDown(deviceID);
        return Ok(powerUsages);
    }

    // ------------------------------------------------------------------------------------

    [HttpGet("power-usage/most-consumes/last-24hours/{userID}")]
    public async Task<ActionResult<Dictionary<DateTime, double>>> GetMostConsumerPast24hoursConsumption(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePast24HoursConsumption(userID);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-produces/last-24hours/{userID}")]
    public async Task<ActionResult<Dictionary<DateTime, double>>> GetMostConsumerPast24hoursPriduction(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePast24HoursProduction(userID);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-consumes/last-week/{userID}")]
    public async Task<ActionResult<Dictionary<DateTime, double>>> GetMostConsumerLastWeekConsumption(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePreviousWeekConsumption(userID);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-produces/last-week/{userID}")]
    public async Task<ActionResult<Dictionary<DateTime, double>>> GetMostConsumerLastWeekProduction(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePreviousWeekProductoin(userID);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-consumes/last-month/{userID}")]
    public async Task<ActionResult<PowerUsage>> GetMostConsumerLastMonthConsumption(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePreviousMonthConsumption(userID, -1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-produces/last-month/{userID}")]
    public async Task<ActionResult<PowerUsage>> GetMostConsumerLastMonthPRoduction(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePreviousMonthProduction(userID, -1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-consumes/current/{userID}")]
    public async Task<ActionResult<PowerUsage>> GetMostConsumerCurrentConsumption(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePreviousCurrentConsumption(userID,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/most-produces/current/{userID}")]
    public async Task<ActionResult<PowerUsage>> GetMostConsumerCurrentProduction(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetMaxUsagePreviousCurrentProduction(userID,1);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/current/user-unused-consumption/{userId}")]
    public async Task<ActionResult<double>> GetHowMuchUserIsConsuming(Guid userId)
    {
        var powerUsages = await _powerUsageService.GetHowMuchUserIsConsuming(userId);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/saved-energy/previous-hour/{deviceID}")]
    public async Task<ActionResult<PowerUsage>> deviceEnergySavedP(Guid deviceID)
    {
        var powerUsages = await _powerUsageService.deviceEnergySaved(deviceID);
        return Ok(powerUsages);
    }

    [HttpGet("power-usage/saved-energy/producer/system/")]
    public async Task<ActionResult<double>> SavedEnergySystemProducer()
    {
        var powerUsage = await _powerUsageService.SavedEnergySystemProducer();
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/saved-energy/consumer/system/")]
    public async Task<ActionResult<double>> SavedEnergySystemConsumer()
    {
        var powerUsage = await _powerUsageService.SavedEnergySystemConsumer();
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/device-system-usage-percent/{deviceID}")]
    public async Task<ActionResult<double>> DeviceSystemUsagePercent(Guid deviceID)
    {
        var powerUsage = await _powerUsageService.DeviceSystemPowerUsage(deviceID);
        return Ok(powerUsage);
    }
    
    [HttpGet("power-usage/user-usage-saved-energy-month/production/{userID}")]
    public async Task<ActionResult<double>> savedEnergyForUserProducer(Guid userID)
    {
        var powerUsage = await _powerUsageService.savedEnergyForUserProducer(userID);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/user-usage-saved-energy-month/consumer/{userID}")]
    public async Task<ActionResult<double>> savedEnergyForUserConsumer(Guid userID)
    {
        var powerUsage = await _powerUsageService.savedEnergyForUserConsumer(userID);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/percentage-difference-for-previous-hour/consumption/{userId}")]
    public async Task<ActionResult<double>> percentPowerUsageDifferenceForPreviousHourConsumption(Guid userId)
    {
        var powerUsage = await _powerUsageService.percentPowerUsageDifferenceForPreviousHourConsumption(userId);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/percentage-difference-for-previous-hour/production/{userId}")]
    public async Task<ActionResult<double>> percentPowerUsageDifferenceForPreviousHourProduction(Guid userId)
    {
        var powerUsage = await _powerUsageService.percentPowerUsageDifferenceForPreviousHourProduction(userId);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/percentage-difference-for-previous-hour/consumption/system")]
    public ActionResult<double> percentPowerUsageDifferenceForPreviousHourConsumptionSystem()
    {
        var powerUsage = _powerUsageService.percentPowerUsageDifferenceForPreviousHourConsumptionSystem();
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/percentage-difference-for-previous-hour/production/system")]
    public ActionResult<double> percentPowerUsageDifferenceForPreviousHourProductionSystem()
    {
        var powerUsage = _powerUsageService.percentPowerUsageDifferenceForPreviousHourProductionSystem();
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/electricityBill/LastMonth/{userID}")]
    public async Task<ActionResult<double>> electricityBill1(Guid userID, double electricityRate)
    {
        var powerUsage = await _powerUsageService.electricityBillLastMonth(userID, electricityRate);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/electricityBill/LastTwoMonth/{userID}")]
    public async Task<ActionResult<double>> electricityBill2(Guid userID, double electricityRate)
    {
        var powerUsage = await _powerUsageService.electricityBill2MonthsAgo(userID, electricityRate);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/electricityEarnings/LastMonth/{userID}")]
    public async Task<ActionResult<double>> electricityEarnings1(Guid userID, double electricityRate)
    {
        var powerUsage = await _powerUsageService.electricityEarningsLastMonth(userID, electricityRate);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/electricityEarnings/LastTwoMonth/{userID}")]
    public async Task<ActionResult<double>> electricityEarnings2(Guid userID, double electricityRate)
    {
        var powerUsage = await _powerUsageService.electricityEarnings2MonthsAgo(userID, electricityRate);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/electricityBill/CurrentMonth/{userID}")]
    public async Task<ActionResult<double>> electricityBillCurrentMonth(Guid userID, double electricityRate)
    {
        var powerUsage = await _powerUsageService.electricityBillCurrentMonth(userID, electricityRate);
        return Ok(powerUsage);
    }

    [HttpGet("power-usage/most-consumes/current/no-user-share-data-check/{userID}")]
    public ActionResult<PowerUsage> GetMostConsumerCurrentConsumptionNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetMaxUsagePreviousCurrentConsumption(userID,1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/most-produces/current/no-user-share-data-check/{userID}")]
    public ActionResult<PowerUsage> GetMostConsumerCurrentProductionNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetMaxUsagePreviousCurrentProduction(userID,1);
        return Ok(powerUsages.Result);
    }
    [HttpGet("power-usage/previous24Hours/consumption/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesConsumptionForPrevious24HoursNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesConsumptionFor24Hours(userID, -1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/next24Hours/consumption/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesConsumptionForNext24HoursNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesConsumptionFor24Hours(userID, 1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/previous24Hours/production/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesProductionForPrevious24HoursNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesProductionFor24Hours(userID, -1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/next24Hours/production/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesProductionForNext24HoursNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesProductionFor24Hours(userID, 1, 1);
        return Ok(powerUsages.Result);
    }
    [HttpGet("power-usage/previous7Days/consumption/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesConsumptionForPrevious7DaysNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesConsumptionFor7Days(userID, -1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/next7Days/consumption/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesConsumptionForNext7DaysNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesConsumptionFor7Days(userID, 1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/previous7Days/production/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesProductionForPrevious7DaysNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesProductionFor7Days(userID, -1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/next7Days/production/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDevicesProductionForNext7DaysNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesProductionFor7Days(userID, 1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/previousMonth/consumption/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageEachDayOfEachDevicePrevMonthConsumptionNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesConsumption(userID, -1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/nextMonth/consumption/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageEachDayOfEachDeviceNextMonthConsumptionNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesConsumption(userID, 1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/previousMonth/production/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageEachDayOfEachDevicePrevMonthProductionNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesProduction(userID, -1, 1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("power-usage/nextMonth/production/user-every-day-device-usage/no-user-share-data-check/{userID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageEachDayOfEachDeviceNextMonthProductionNoShareDataCheck(Guid userID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForDevicesProduction(userID, 1, 1);
        return Ok(powerUsages.Result);
    }
    [HttpGet("power-usage/past24h/prediction{deviceID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForDayPrediction(Guid deviceID)
    {
        var powerUsages = _powerUsageService.GetForDeviceByHourPrediction(deviceID);
        return Ok(powerUsages.Result);
    }
    [HttpGet("power-usage/pastweek/prediction{deviceID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageFor7DaysPrediction(Guid deviceID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageFor7DaysPrediction(deviceID, -1);
        return Ok(powerUsages.Result);
    }
    [HttpGet("power-usage/pastmonth/prediction{deviceID}")]
    public ActionResult<List<PowerUsage>> GetPowerUsageForAMonthPrediction(Guid deviceID)
    {
        var powerUsages = _powerUsageService.GetPowerUsageForAMonthPrediction(deviceID, -1);
        return Ok(powerUsages.Result);
    }

    [HttpGet("update-batteries")]
    public async Task UpdateBatteries()
    {
        try
        {
            await _powerUsageService.UpdateBatteries();
        }
        catch (ArgumentNullException ex)
        {
            throw new ArgumentException(ex.Message);
        }
    }

    [HttpGet("power-usage/get-current-user-battery-power-available/{userID}")]
    public async Task<ActionResult<double>> GetForUserBatteryPower(Guid userID)
    {
        var powerUsages = await _powerUsageService.GetForUserBatteryPower(userID);
        return Ok(powerUsages);
    }
    [HttpGet("power-usage/get-current-user-battery-percentage/{deviceID}")]
    public async Task<ActionResult<double>> GetPercentage(Guid deviceID)
    {
        var powerUsages = await _powerUsageService.GetBatteryPercentage(deviceID);
        return Ok(powerUsages);
    }
}
