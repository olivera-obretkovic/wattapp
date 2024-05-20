using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using prosumerAppBack.Models;

namespace prosumerAppBack.BusinessLogic.PowerUsageService;

public interface IPowerUsageService
{
    public Task<double> GetForDevice(Guid deviceID);
    public Task<double> GetPowerUsageForDay(Guid deviceID, DateTime today);
    public Task<PowerUsage> GetPowerUsageFor7Days(Guid deviceId, int direction);
    public Task<PowerUsage> GetPowerUsageForAMonth(Guid deviceId, int direction);
    public Task<double> AverageSumPowerUsageProduction(Guid userID);
    public Task<double> AverageSumPowerUsageConsumtion(Guid userID);
    public Task<double> CurrentSumPowerUsageProduction(Guid userID);
    public Task<double> CurrentSumPowerUsageConsumption(Guid userID);
    public Task<PowerUsage> GetPowerConsumedForADaySystem();
    public Task<PowerUsage> GetPowerProducedForADaySystem();
    public Task<double> GetCurrentPowerProduction();
    public Task<double> GetCurrentPowerConsumption();
    public Task<double> CurrentSumPowerUsageSystemConsumer();
    public Task<double> CurrentSumPowerUsageSystemProducer();
    public Task<double> GetPoweUsageForAMonthSystemProducer(int direction);
    public Task<double> GetPoweUsageForAMonthSystemConsumer(int direction);
    public Task<List<PowerUsage>> GetPowerUsageSumByDeviceConsumer(int direction);
    public Task<List<PowerUsage>> GetPowerUsageSumByDeviceProducer(int direction);
    public Task<PowerUsage> GetPowerUsagesForEachDayConsumtionMonth(int direction);
    public Task<PowerUsage> GetPowerUsagesForEachDayProductionMonth(int direction);
    public Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHour(Guid deviceID);
    public Task<List<PowerUsage>> GetPowerUsageForDevicesConsumption(Guid userID, int direction, int shareDso);//
    public Task<List<PowerUsage>> GetPowerUsageForDevicesProduction(Guid userID, int direction, int shareDso);//
    public Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor7Days(Guid userID, int direction, int shareDso);//
    public Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor7Days(Guid userID, int direction, int shareDso);//
    public Task<PowerUsage> GetPowerUsageFor12HoursUpDown(Guid deviceID);
    public Task<PowerUsage> GetPowerUsageForDevicePast24Hours(Guid deviceID, int direction);
    public Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor24Hours(Guid userID, int direction, int shareDso);//
    public Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor24Hours(Guid userID, int direction, int shareDso);//
    public Task<PowerUsage> GetMaxUsagePast24HoursConsumption(Guid userID);
    public Task<PowerUsage> GetMaxUsagePast24HoursProduction(Guid userID);
    public Task<PowerUsage> GetMaxUsagePreviousWeekConsumption(Guid userID);
    public Task<PowerUsage> GetMaxUsagePreviousMonthConsumption(Guid userID, int direction);
    public Task<PowerUsage> GetMaxUsagePreviousCurrentConsumption(Guid userID, int dsoShare);
    public Task<PowerUsage> GetMaxUsagePreviousWeekProductoin(Guid userID);
    public Task<PowerUsage> GetMaxUsagePreviousMonthProduction(Guid userID, int direction);
    public Task<PowerUsage> GetMaxUsagePreviousCurrentProduction(Guid userID, int dsoShare);
    public Task<double> SavedEnergySystemProducer();
    public Task<double> SavedEnergySystemConsumer();
    public Task<double> DeviceSystemPowerUsage(Guid deviceID);
    public Task<double> GetHowMuchUserIsConsuming(Guid userId);
    public Task<double> deviceEnergySaved(Guid deviceID);
    public Task<double> savedEnergyForUserConsumer(Guid userID);
    public Task<double> savedEnergyForUserProducer(Guid userID);
    public Task<PowerUsage> GetPowerUsagesForEachDayProductionWeek(int direction);
    public Task<PowerUsage> GetPowerUsagesForEachDayConsumptionWeek(int direction);
    public Task<PowerUsage> GetPowerUsagesForEachDayConsumption24h(int direction);
    public Task<PowerUsage> GetPowerUsagesForEachDayProduction24h(int direction);
    public Task<double> percentPowerUsageDifferenceForPreviousHourConsumption(Guid userId);
    public Task<double> percentPowerUsageDifferenceForPreviousHourProduction(Guid userId);
    public Task<double> electricityBillLastMonth(Guid userID, double electricityRate);
    public Task<double> electricityBill2MonthsAgo(Guid userID, double electricityRate);
    public Task<double> electricityEarnings2MonthsAgo(Guid userID, double electricityRate);
    public Task<double> electricityEarningsLastMonth(Guid userID, double electricityRate);
    public Task<double> electricityBillCurrentMonth(Guid userID, double electricityRate);
    object? percentPowerUsageDifferenceForPreviousHourConsumptionSystem();
    object? percentPowerUsageDifferenceForPreviousHourProductionSystem();
    object? electricityBillForCurrentMonth(Guid userId, double electricityRate);
    object? electricityEarningsForCurrentMonth(Guid userId, double electricityRate);
    
    public Task<double> GetPowerUsageForDayPrediction(Guid deviceID, DateTime today);

    public Task<PowerUsage> GetPowerUsageFor7DaysPrediction(Guid deviceId, int direction);

    public Task<PowerUsage> GetPowerUsageForAMonthPrediction(Guid deviceId, int direction);
    Task UpdateBatteries();
    Task<double> GetForUserBatteryPower(Guid userID);
    
    public Task<double> GetBatteryPercentage(Guid deviceID);
    
    public Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHourPrediction(Guid deviceID);
}
