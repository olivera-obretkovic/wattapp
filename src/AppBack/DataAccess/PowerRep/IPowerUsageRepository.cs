using System;
using MongoDB.Driver;
using prosumerAppBack.DataAccess;
using prosumerAppBack.Models;

namespace prosumerAppBack.BusinessLogic
{
    public interface IPowerUsageRepository
    {
        public Task<double> GetForDevice(Guid deviceID);// provereno
        public Task<double> AveragePowerUsageProduction(Guid userID); // prosecna potrosnja svih uredjaja korisnika inace
        public Task<double> AveragePowerUsageConsumption(Guid userID);
        public Task<double> CurrentSumPowerUsageConsumption(Guid userID); // trenutnaGetPowerUsageForDay ukupna potrosnja svih uredjaja korisnika
        public Task<double> CurrentSumPowerUsageProduction(Guid userID);
        public Task<double> GetPowerUsageForDay(Guid deviceId, DateTime today);// provereno
        public Task<PowerUsage> GetPowerUsageFor7Days(Guid deviceId, int direction);// provereno
        public Task<PowerUsage> GetPowerUsageForAMonth(Guid deviceId, int direction);
        public Task<double> GetPowerUsageForAMonthSystemConsumer(int direction);
        public Task<double> GetPowerUsageForAMonthSystemProducer(int direction);
        public Task<List<PowerUsage>> GetPowerUsageSumByDeviceProducer(int direction); // za svaki uredjaj u sitemu vraca njegovu ukupnu potrosnju za prethodnih/sledecih mesec dana
        public Task<List<PowerUsage>> GetPowerUsageSumByDeviceConsumer(int direction);
        public Task<PowerUsage> GetPowerUsagesForEachDayProductionMonth(int direction); // za svaki dan prethodnih/sledecih mesec dana ukupna potrosnja svih uredjaja u danu
        public Task<PowerUsage> GetPowerUsagesForEachDayConsumptionMonth(int direction);
        public Task<List<PowerUsage>> GetPowerUsageForDevicesProduction(Guid userID, int direction, int shareData);
        public Task<List<PowerUsage>> GetPowerUsageForDevicesConsumption(Guid userID, int direction,int shareData);        
        public Task<PowerUsage> GetPowerUsageForDevicePast24Hours(Guid deviceID, int direction);       
        public Task<PowerUsage> GetPowerConsumedForADaySystem();
        public Task<PowerUsage> GetPowerProducedForADaySystem();
        public Task<double> GetCurrentPowerConsumption();
        public Task<double> GetCurrentPowerProduction();        
        public Task<double> CurrentSumPowerUsageSystemConsumer();
        public Task<double> CurrentSumPowerUsageSystemProducer();
        public Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor7Days(Guid userID, int direction, int shareData);
        public Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor7Days(Guid userID, int direction, int shareData);
        public Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor24Hours(Guid userID, int direction, int shareData);
        public Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor24Hours(Guid userID, int direction, int shareData);
        public Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHour(Guid deviceID);//provereno i promenjeno da vraca do trenutnog_sata -1 a ne za ceo dan
        public Task<PowerUsage> GetDeviceWithMaxPowerUsage24Production(Guid userID);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsage24Consumption(Guid userID);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousWeekProduction(Guid userID);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousMonthProduction(Guid userID, int direction);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsageCurrentProduction(Guid userID, int shareData);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousWeekConsumption(Guid userID);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousMonthConsumption(Guid userID, int direction);
        public Task<PowerUsage> GetDeviceWithMaxPowerUsageCurrentConsumption(Guid userID, int shareData);
        public Task<PowerUsage> Get12hoursBefore12hoursAfter(Guid deviceID);
        public Task<double> SavedEnergySystemConsumer();
        public Task<double> SavedEnergySystemProducer();
        public Task<double> percentPowerUsageForPreviousHour(Guid deviceID);
        public Task<double> GetHowMuchUserIsConsuming(Guid userId);
        public Task<double> deviceEnergySaved(Guid deviceID);
        public Task<double> savedEnergyForUserProducer(Guid userID);
        public Task<double> savedEnergyForUserConsumer(Guid userID);
        public Task<PowerUsage> GetPowerUsagesForEachDayProductionWeek(int direction);
        public Task<PowerUsage> GetPowerUsagesForEachDayConsumptionWeek(int direction);
        public Task<PowerUsage> GetPowerUsagesForEachDayProduction24h(int direction);
        public Task<PowerUsage> GetPowerUsagesForEachDayConsumption24h(int direction);
        public Task<double> percentPowerUsageDifferenceForPreviousHourConsumption(Guid userId);
        public Task<double> percentPowerUsageDifferenceForPreviousHourProduction(Guid userId);
        public Task<double> electricityBillLastMonth(Guid userID, double electricityRate);
        public Task<double> electricityBill2MonthsAgo(Guid userID, double electricityRate);
        public Task<double> electricityEarningsLastMonth(Guid userID, double electricityRate);
        public Task<double> electricityEarnings2MonthsAgo(Guid userID, double electricityRate);
        public Task<double> electricityBillCurrentMonth(Guid userID, double electricityRate);
        public double PercentPowerUsageDifferenceForPreviousHourConsumptionSystem();
        public double ElectricityBillForCurrentMonth(Guid userID, double electricityRate);

        public Task<double> GetPowerUsageForDayPrediction(Guid deviceID, DateTime today);

        public Task<PowerUsage> GetPowerUsageFor7DaysPrediction(Guid deviceId, int direction);

        public Task<PowerUsage> GetPowerUsageForAMonthPrediction(Guid deviceId, int direction);
        Task UpdateBatteries();
        Task<double> GetForUserBatteryPower(Guid userID);
        public Task<double> GetBatteryPercentage(Guid deviceID);

        public Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHourPrediction(Guid deviceID);
    }
}