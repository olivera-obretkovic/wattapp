using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.IdentityModel.Tokens;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;
using SendGrid.Helpers.Errors.Model;

namespace prosumerAppBack.BusinessLogic.PowerUsageService;

public class PowerUsageService:IPowerUsageService
{
    private readonly IPowerUsageRepository _repository;

    public PowerUsageService(IPowerUsageRepository repository)
    {
        _repository = repository;
    }

    public async Task<double> GetPowerUsageForDay(Guid deviceID, DateTime today)
    {
        var powerUsages = await _repository.GetPowerUsageForDay(deviceID, today);
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }

    public async Task<PowerUsage> GetPowerUsageFor7Days(Guid deviceId, int direction)
    {
        var powerUsages = await _repository.GetPowerUsageFor7Days(deviceId, direction);
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }

    public async Task<PowerUsage> GetPowerUsageForAMonth(Guid deviceId, int direction)
    {
        var powerUsages = await _repository.GetPowerUsageForAMonth(deviceId, direction);
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }

    public async Task<double> AverageSumPowerUsageProduction(Guid userID)
    {
        var powerUsages = await _repository.AveragePowerUsageProduction(userID);
        if (powerUsages == 0)
        {
            throw new NotFoundException();
        }
        if (powerUsages == 1)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return powerUsages;
    }

    public async Task<double> AverageSumPowerUsageConsumtion(Guid userID)
    {
        var powerUsages = await _repository.AveragePowerUsageConsumption(userID);
        if (powerUsages == 0)
        {
            return 0;
        }

        if(powerUsages == 1)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }

        return powerUsages;
    }

    public async Task<double> CurrentSumPowerUsageProduction(Guid userID) 
    {
        var powerUsages = await _repository.CurrentSumPowerUsageProduction(userID);
        if (powerUsages == 0)
            return 0;
        return powerUsages;
    }

    public async Task<double> CurrentSumPowerUsageConsumption(Guid userID)
    {
        var powerUsages = await _repository.CurrentSumPowerUsageConsumption(userID);
        if (powerUsages == 0)
            return 0;
        return powerUsages;
    }

    public async Task<double> CurrentSumPowerUsageSystemConsumer()
    {
        var powerUsage = await _repository.CurrentSumPowerUsageSystemConsumer();
        if (powerUsage == 0)
        {
            return 0;
        }
        return powerUsage;
    }

    public async Task<double> CurrentSumPowerUsageSystemProducer()
    {
        var powerUsage = await _repository.CurrentSumPowerUsageSystemProducer();
        if (powerUsage == 0)
        {
            return 0;
        }
        return powerUsage;
    }

    public async Task<double> GetPoweUsageForAMonthSystemProducer(int direction)
    {
        var powerUsage = await _repository.GetPowerUsageForAMonthSystemProducer(direction);
        if (powerUsage == 0)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<double> GetPoweUsageForAMonthSystemConsumer(int direction)
    {
        var powerUsage = await _repository.GetPowerUsageForAMonthSystemConsumer(direction);
        if (powerUsage == 0)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<List<PowerUsage>> GetPowerUsageSumByDeviceProducer(int direction)
    {
        var powerUsage = await _repository.GetPowerUsageSumByDeviceProducer(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<List<PowerUsage>> GetPowerUsageSumByDeviceConsumer(int direction)
    {
        var powerUsage = await _repository.GetPowerUsageSumByDeviceConsumer(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayProductionMonth(int direction)
    {
        var powerUsage = await _repository.GetPowerUsagesForEachDayProductionMonth(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }
     
    public async Task<PowerUsage> GetPowerUsagesForEachDayConsumtionMonth(int direction)
    {
        var powerUsage = await _repository.GetPowerUsagesForEachDayConsumptionMonth(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayConsumptionWeek(int direction)
    {
        var powerUsage = await _repository.GetPowerUsagesForEachDayConsumptionWeek(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayProductionWeek(int direction)
    {
        var powerUsage = await _repository.GetPowerUsagesForEachDayProductionWeek(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayConsumption24h(int direction)
    {
        var powerUsage = await _repository.GetPowerUsagesForEachDayConsumption24h(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayProduction24h(int direction)
    {
        var powerUsage = await _repository.GetPowerUsagesForEachDayProduction24h(direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesProduction(Guid userID, int direction, int dsoShare)
    {
        var powerUsages = await _repository.GetPowerUsageForDevicesProduction(userID, direction,dsoShare);
        if (!powerUsages.Any())
        {
            throw new NotFoundException("Uses does not share data with DSO");
        }
        return powerUsages;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesConsumption(Guid userID, int direction, int dsoShare)
    {
        var powerUsages = await _repository.GetPowerUsageForDevicesConsumption(userID, direction,dsoShare);
        if (!powerUsages.Any())
        {
            throw new NotFoundException("Uses does not share data with DSO");
        }
        return powerUsages;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor7Days(Guid userID, int direction, int dsoShare)
    {
        var powerUsages = await _repository.GetPowerUsageForDevicesConsumptionFor7Days(userID, direction,dsoShare);
        if (!powerUsages.Any())
        {
            throw new NotFoundException("Uses does not share data with DSO");
        }
        return powerUsages;
    }
    public async Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor7Days(Guid userID, int direction, int dsoShare)
    {
        var powerUsages = await _repository.GetPowerUsageForDevicesProductionFor7Days(userID, direction,dsoShare);
        if (!powerUsages.Any())
        {
            throw new NotFoundException("Uses does not share data with DSO");
        }
        return powerUsages;
    }
    public async Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor24Hours(Guid userID, int direction, int dsoShare)
    {
        var powerUsages = await _repository.GetPowerUsageForDevicesConsumptionFor24Hours(userID, direction,dsoShare);
        if (!powerUsages.Any())
        {
            throw new NotFoundException("Uses does not share data with DSO");
        }
        return powerUsages;
    }
    public async Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor24Hours(Guid userID, int direction, int dsoShare)
    {
        var powerUsages = await _repository.GetPowerUsageForDevicesProductionFor24Hours(userID, direction,dsoShare);
        if (!powerUsages.Any())
        {
            throw new NotFoundException("Uses does not share data with DSO");
        }
        return powerUsages;
    }

    public async Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHour(Guid deviceID)
    {
        var powerUsages =  await _repository.GetForDeviceByHour(deviceID);
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }

    public async Task<double> GetForDevice(Guid deviceID)
    {
        var powerUsages =  await _repository.GetForDevice(deviceID);
        if (powerUsages == -1)
            return -1;
        if (powerUsages == 0)
            return 0;
        return powerUsages;
    }

    public async Task<PowerUsage> GetPowerProducedForADaySystem()
    {
        var powerUsages = await _repository.GetPowerProducedForADaySystem();
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }
    public async Task<PowerUsage> GetPowerConsumedForADaySystem()
    {
        var powerUsages = await _repository.GetPowerConsumedForADaySystem();
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }

    public async Task<double> GetCurrentPowerConsumption()
    {
        var powerUsages = await _repository.GetCurrentPowerConsumption();
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }
    public async Task<double> GetCurrentPowerProduction()
    {
        var powerUsages = await _repository.GetCurrentPowerProduction();
        if (powerUsages == null)
        {
            throw new NotFoundException();
        }
        return powerUsages;
    }

    public async Task<PowerUsage> GetPowerUsageFor12HoursUpDown(Guid deviceID)
    {
        var powerUsage = await _repository.Get12hoursBefore12hoursAfter(deviceID);
        if(powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<PowerUsage> GetMaxUsagePast24HoursConsumption(Guid userID)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsage24Consumption(userID);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePast24HoursProduction(Guid userID)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsage24Production(userID);
        if(result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePreviousWeekConsumption(Guid userID)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsagePreviousWeekConsumption(userID);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePreviousMonthConsumption(Guid userID, int direction)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsagePreviousMonthConsumption(userID, direction);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePreviousCurrentConsumption(Guid userID, int dsoShare)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsageCurrentConsumption(userID,dsoShare);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePreviousWeekProductoin(Guid userID)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsagePreviousWeekProduction(userID);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePreviousMonthProduction(Guid userID, int direction)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsagePreviousMonthProduction(userID, direction);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetMaxUsagePreviousCurrentProduction(Guid userID, int dsoShare)
    {
        PowerUsage result = await _repository.GetDeviceWithMaxPowerUsageCurrentProduction(userID,dsoShare);
        if (result == null)
        {
            throw new NullReferenceException("User does not share data with DSO");
        }
        return result;
    }

    public async Task<PowerUsage> GetPowerUsageForDevicePast24Hours(Guid deviceID, int direction)
    {
        var powerUsage = await _repository.GetPowerUsageForDevicePast24Hours(deviceID, direction);
        if (powerUsage == null)
        {
            throw new NotFoundException();
        }
        return powerUsage;
    }

    public async Task<double> GetHowMuchUserIsConsuming(Guid userID)
    {
        var powerUsages = await _repository.GetHowMuchUserIsConsuming(userID);
        if (powerUsages == 0)
        {
            throw new NotFoundException("User doesnt share data with DSO");
        }
        return powerUsages;
    }

    public async Task<double> deviceEnergySaved(Guid deviceID)
    {
        var powerUsage = await _repository.deviceEnergySaved(deviceID);
        return powerUsage;
    }

    public async Task<double> SavedEnergySystemConsumer()
    {
        var powerUsage = await _repository.SavedEnergySystemConsumer();
        return powerUsage;
    }

    public async Task<double> SavedEnergySystemProducer()
    {
        var powerUsage = await _repository.SavedEnergySystemProducer();
        return powerUsage;
    }

    public async Task<double> DeviceSystemPowerUsage(Guid deviceID)
    {
        var powerUsage = await _repository.percentPowerUsageForPreviousHour(deviceID);
        return powerUsage;
    }

    public async Task<double> savedEnergyForUserProducer(Guid userID)
    {
        var powerUsage = await _repository.savedEnergyForUserProducer(userID);
        if(powerUsage == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return powerUsage;
    }

    public async Task<double> savedEnergyForUserConsumer(Guid userID)
    {
        var powerUsage = await _repository.savedEnergyForUserConsumer(userID);
        if (powerUsage == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return powerUsage;
    }

    public async Task<double> percentPowerUsageDifferenceForPreviousHourConsumption(Guid userId)
    {
        var powerUsage = await _repository.percentPowerUsageDifferenceForPreviousHourConsumption(userId);
        if(double.IsNaN(powerUsage))
        {
            return 0.0;
        }
        if(double.IsInfinity(powerUsage))
        {
            return 0.0;
        }
        return powerUsage;
    }

    public async Task<double> percentPowerUsageDifferenceForPreviousHourProduction(Guid userId)
    {
        var powerUsage = await _repository.percentPowerUsageDifferenceForPreviousHourProduction(userId);
        if (double.IsNaN(powerUsage))
        {
            return 0.0;
        }
        if (double.IsInfinity(powerUsage))
        {
            return 0.0;
        }
        return powerUsage;
    }

    public async Task<double> electricityBill2MonthsAgo(Guid userID, double electricityRate)
    {
        var price = await _repository.electricityBill2MonthsAgo(userID, electricityRate);
        if (price == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return price; 
    }

    public async Task<double> electricityBillLastMonth(Guid userID, double electricityRate)
    {
        var price = await _repository.electricityBillLastMonth(userID, electricityRate);
        if (price == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return price;
    }

    public async Task<double> electricityEarnings2MonthsAgo(Guid userID, double electricityRate)
    {
        var price = await _repository.electricityEarnings2MonthsAgo(userID, electricityRate);
        if (price == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return price;
    }

    public async Task<double> electricityEarningsLastMonth(Guid userID, double electricityRate)
    {
        var price = await _repository.electricityEarningsLastMonth(userID, electricityRate);
        if (price == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return price;
    }

    public async Task<double> electricityBillCurrentMonth(Guid userID, double electricityRate)
    {
        var price = await _repository.electricityBillCurrentMonth(userID, electricityRate);
        if (price == 0)
        {
            throw new NullReferenceException("User doesnt share data with DSO");
        }
        return price;
    }

    public object? percentPowerUsageDifferenceForPreviousHourConsumptionSystem()
    {
        return 0;
    }

    public object? percentPowerUsageDifferenceForPreviousHourProductionSystem()
    {
        return 0;
    }

    public object? electricityBillForCurrentMonth(Guid userId, double electricityRate)
    {
        return 0;
    }

    public object? electricityEarningsForCurrentMonth(Guid userId, double electricityRate)
    {
        return 0;
    }

    public Task<double> GetPowerUsageForDayPrediction(Guid deviceID, DateTime today)
    {
        return _repository.GetPowerUsageForDayPrediction(deviceID, today);
    }

    public Task<PowerUsage> GetPowerUsageFor7DaysPrediction(Guid deviceId, int direction)
    {
        return _repository.GetPowerUsageFor7DaysPrediction(deviceId,-1);
    }

    public Task<PowerUsage> GetPowerUsageForAMonthPrediction(Guid deviceId, int direction)
    {
        return _repository.GetPowerUsageForAMonthPrediction(deviceId,-1);
    }

    public async Task UpdateBatteries()
    {
        await _repository.UpdateBatteries();
    }

    public async Task<double> GetForUserBatteryPower(Guid userID)
    {
        var batteryPower = await _repository.GetForUserBatteryPower(userID);
        return batteryPower;
    }

    public async Task<double> GetBatteryPercentage(Guid deviceID)
    {
        var battPerc = await _repository.GetBatteryPercentage(deviceID);

        return battPerc;
    }

    public async Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHourPrediction(Guid deviceID)
    {
        var hour = await _repository.GetForDeviceByHourPrediction(deviceID);

        return hour;
    }
}
