using System.Linq;
using Internal;
using System;
using System.Collections.Generic;
using System.Collections.Concurrent;
using Microsoft.EntityFrameworkCore;
using MongoDB.Bson;
using MongoDB.Driver;
using prosumerAppBack.BusinessLogic;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;

namespace prosumerAppBack.DataAccess;

public class PowerUsageRepository : IPowerUsageRepository
{
    private readonly IMongoCollection<PowerUsage> mongoCollection;
    private readonly IMongoCollection<PowerUsage> mongoCollectionPrediction;
    private readonly DataContext _dataContext;
    private readonly IDeviceRepository _deviceRepository;

    public PowerUsageRepository(MongoDataContext mongoDataContext, DataContext dataContext, IDeviceRepository deviceRepository)
    {
        mongoCollection = mongoDataContext.PowerUsage;
        mongoCollectionPrediction = mongoDataContext.PowerUsagePrediction;
        _dataContext = dataContext;
        _deviceRepository = deviceRepository;
    }

    public async Task<double> GetForDeviceAverage(Guid deviceID)
    {
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour);
        DateTime lastWeekTimestamp = currentHourTimestamp.AddDays(-7);

        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsageData = mongoCollection.AsQueryable()
            .FirstOrDefault(d => d.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper());

        var hourDataInRange = powerUsageData.TimestampPowerPairs
            .Where(p => p.Timestamp >= lastWeekTimestamp && p.Timestamp <= currentHourTimestamp);

        if (hourDataInRange.Any())
        {
            var averagePowerUsage = hourDataInRange.Average(p => p.PowerUsage);
            return averagePowerUsage;
        }

        return -1;
    }

    public async Task<double> GetForDevice(Guid deviceID)
    {
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour);

        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID == deviceTypeID)
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();
        if(deviceGroupName == "Storage")
        {
            var baterry = await _dataContext.BatteryStatuses.FirstOrDefaultAsync(e => e.ID == deviceID && e.Date == currentHourTimestamp);
            if (baterry == null)
            {
                return 0;
            }
            var batteryCapacity = await _dataContext.Devices
                                    .Include(d => d.DeviceType)
                                    .ThenInclude(dt => dt.Manufacturer)
                                    .Include(d => d.DeviceType)
                                    .ThenInclude(dt => dt.Group)
                                    .Where(d => d.ID == baterry.ID)
                                    .Select(d => d.DeviceType.Wattage)
                                    .FirstOrDefaultAsync();
            var batteryPercent = _dataContext.BatteryStatuses.FirstOrDefaultAsync(e => e.ID == baterry.ID && e.Date == currentHourTimestamp).Result.BatteryPercent;
            double batteryPower = batteryCapacity * (batteryPercent / 100);
            return batteryPower;
        }
        else 
        {
            var powerUsageData = mongoCollection.AsQueryable()
                .FirstOrDefault(d => d.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper());

            var data = powerUsageData.TimestampPowerPairs.Find(p => p.Timestamp == currentHourTimestamp);

            bool isOn = _dataContext.Devices
                .Where(d => d.ID == deviceID)
                .Select(ison => ison.IsOn)
                .FirstOrDefault();

            var current = data.PowerUsage;

            if (isOn && current == 0)
                return await GetForDeviceAverage(deviceID); // Add await keyword here

            if (isOn && current != 0)
                return current;

            return 0;
        }        
    }


    public async Task<double> AveragePowerUsageProduction(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

        if (DSOshare == false)
            return 1;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        double sum = 0;

        foreach (var device in devices)
        {
            Guid deviceTypeID = _dataContext.Devices
           .Where(d => d.ID == device.ID)
           .Select(d => d.DeviceTypeID)
           .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID == deviceTypeID)
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();

            if (deviceGroupName == null)
            {
                return 0;
            }

            if (deviceGroupName == "Producer" && device.IsOn == true)
            {
                foreach (var VARIABLE in devices)
                {
                    sum += await GetForDevice(VARIABLE.ID);
                }
            }          
        }
        return sum / devices.Count();
    }

    public async Task<double> AveragePowerUsageConsumption(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

        if (DSOshare == false)
            return 1;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        double sum = 0;

        foreach (var device in devices)
        {
            Guid deviceTypeID = _dataContext.Devices
           .Where(d => d.ID == device.ID)
           .Select(d => d.DeviceTypeID)
           .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID == deviceTypeID)
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();


            if(deviceGroupName == null)
            {
                return 0;
            }

            if (deviceGroupName == "Consumer" && device.IsOn == true)
            {              
                    sum += await GetForDevice(device.ID);
            }
        }
        return sum / devices.Count();
    }

    public async Task<double> GetPowerUsageForDay(Guid deviceID, DateTime today)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

            var powerUsageData = mongoCollection
                .AsQueryable()
                .FirstOrDefault(p => p.ID.ToString() == deviceTypeID.ToString().ToUpper());

            if (powerUsageData == null)
            {
                return 0;
            }

            double totalPowerUsage = powerUsageData.TimestampPowerPairs
                .Where(pair => pair.Timestamp.Date == today)
                .Sum(pair => pair.PowerUsage);
            return totalPowerUsage;
    }
    
    public async Task<double> GetPowerUsageForDayPrediction(Guid deviceID, DateTime today)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsageData = mongoCollectionPrediction
            .AsQueryable()
            .FirstOrDefault(p => p.ID.ToString() == deviceTypeID.ToString().ToUpper());

        if (powerUsageData == null)
        {
            return 0;
        }

        double totalPowerUsage = powerUsageData.TimestampPowerPairs
            .Where(pair => pair.Timestamp.Date == today)
            .Sum(pair => pair.PowerUsage);
        return totalPowerUsage;
    }
    
    public async Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHourPrediction(Guid deviceID)
    {
        DateTime back = DateTime.Now.AddHours(-24);
        DateTime currentHour = DateTime.Now.AddHours(-1);

        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();


        var powerUsageData = mongoCollectionPrediction.AsQueryable()
            .FirstOrDefault(p => p.ID.ToString() == deviceTypeID.ToString().ToUpper())
            ?.TimestampPowerPairs
            .Where(t => t.Timestamp >= back && t.Timestamp <= currentHour);

        return powerUsageData;
    }
    
    public async Task<PowerUsage> GetPowerUsageFor7DaysPrediction(Guid deviceId, int direction)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceId)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();
        var today = DateTime.Today;

        for (int i = 1; i <= 7; i++)
        {
            var day = today.AddDays(i * direction);
            var powerUsageD = await GetPowerUsageForDay(deviceId, day);
            var ts = new TimestampPowerPair();
            ts.PowerUsage = powerUsageD;
            ts.Timestamp = day;
            powerUsage.TimestampPowerPairs.Add(ts);

        }

        if (direction == -1)
            powerUsage.TimestampPowerPairs.Reverse();

        return powerUsage;
    }
    
    public async Task<PowerUsage> GetPowerUsageForAMonthPrediction(Guid deviceId, int direction)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceId)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();
        var today = DateTime.Today;

        for (int i = 1; i <= 31; i++)
        {
            var day = today.AddDays(i * direction);
            var powerUsageD = await GetPowerUsageForDay(deviceId, day);
            var ts = new TimestampPowerPair();
            ts.PowerUsage = powerUsageD;
            ts.Timestamp = day;
            powerUsage.TimestampPowerPairs.Add(ts);

        }

        if (direction == -1)
            powerUsage.TimestampPowerPairs.Reverse();

        return powerUsage;
    }
    
    public async Task<PowerUsage> GetPowerUsageFor7Days(Guid deviceId, int direction)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceId)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

            var powerUsage = new PowerUsage();
            powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();
            var today = DateTime.Today;

            for (int i = 1; i <= 7; i++)
            {
                var day = today.AddDays(i * direction);
                var powerUsageD = await GetPowerUsageForDay(deviceId, day);
                var ts = new TimestampPowerPair();
                ts.PowerUsage = powerUsageD;
                ts.Timestamp = day;
                powerUsage.TimestampPowerPairs.Add(ts);

            }

            if (direction == -1)
                powerUsage.TimestampPowerPairs.Reverse();

        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerUsageForAMonth(Guid deviceId, int direction)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceId)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();
        var today = DateTime.Today;

        for (int i = 1; i <= 31; i++)
        {
            var day = today.AddDays(i * direction);
            var powerUsageD = await GetPowerUsageForDay(deviceId, day);
            var ts = new TimestampPowerPair();
            ts.PowerUsage = powerUsageD;
            ts.Timestamp = day;
            powerUsage.TimestampPowerPairs.Add(ts);

        }

        if (direction == -1)
            powerUsage.TimestampPowerPairs.Reverse();

        return powerUsage;
    }

    public async Task<double> CurrentSumPowerUsageConsumption(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

       // if (DSOshare == false)
          //  return 0;

        double sum = 0;
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour);

        var devicesTypes = _deviceRepository.GetDevicesForUser(userID);
        foreach(var device in devicesTypes)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();

            if (deviceGroupName == "Consumer" && device.IsOn == true)
            {
                var powerUsageData = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .ToList()
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(t => t.Timestamp == currentHourTimestamp);

                sum += powerUsageData.Sum(p => p.PowerUsage);
            }
        } 
        return sum;
    }

    public async Task<double> CurrentSumPowerUsageProduction(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

      //  if (DSOshare == false)
        //    return 0;

        double sum = 0;
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour);

        var devicesTypes = _deviceRepository.GetDevicesForUser(userID);
        foreach (var device in devicesTypes)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();

            if (deviceGroupName == "Producer" && device.IsOn == true)
            {
                var powerUsageData = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .ToList()
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(t => t.Timestamp == currentHourTimestamp);

                sum += powerUsageData.Sum(p => p.PowerUsage);
            }
        }
        return sum;
    }

    public async Task<double> CurrentSumPowerUsageSystemProducer()
    {
        DateTime currentHourTimestamp = DateTime.Now.AddHours(-1);
        double sum = 0;

        var powerUsageData = mongoCollection.AsQueryable()
           .Select(d => d.ID)
           .ToList();

        foreach (var device in powerUsageData)
        {
            Guid userID = _dataContext.Devices
                        .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                        .Select(u => u.OwnerID)
                        .FirstOrDefault();
            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
           .Where(g => g.ID == _dataContext.DeviceTypes
               .Where(dt => dt.ID == device)
               .Select(dt => dt.GroupID)
               .FirstOrDefault())
           .Select(g => g.Name)
           .FirstOrDefault();

            bool isOn = _dataContext.Devices
                    .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                    .Select(ison => ison.IsOn)
                    .FirstOrDefault();

            if (DSOshare == true && deviceGroupName == "Producer" && isOn == true)
            {
                sum += await GetCurrentPowerUsage(currentHourTimestamp, device);
            }
        }    

        return sum;
    }
    public async Task<double> CurrentSumPowerUsageSystemConsumer()
    {
        DateTime currentHourTimestamp = DateTime.Now.AddHours(-1);
        double sum = 0;

        var powerUsageData = mongoCollection.AsQueryable()
           .Select(d => d.ID)
           .ToList();

        foreach (var device in powerUsageData)
        {
            var userID = _dataContext.Devices
                       .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                       .Select(u => u.OwnerID)
                       .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
           .Where(g => g.ID == _dataContext.DeviceTypes
               .Where(dt => dt.ID == device)
               .Select(dt => dt.GroupID)
               .FirstOrDefault())
           .Select(g => g.Name)
           .FirstOrDefault();

            bool isOn = _dataContext.Devices
                    .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                    .Select(ison => ison.IsOn)
                    .FirstOrDefault();

            if (DSOshare == true && deviceGroupName == "Consumer" && isOn == true)
            {
                sum += await GetCurrentPowerUsage(currentHourTimestamp, device);
            }
        }

        return sum;
    }

    public async Task<IEnumerable<TimestampPowerPair>> GetForDeviceByHour(Guid deviceID)
    {
        DateTime currentDay = DateTime.Today;
        DateTime currentHour = DateTime.Now.AddHours(-1);

        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();


        var powerUsageData = mongoCollection.AsQueryable()
            .FirstOrDefault(p => p.ID.ToString() == deviceTypeID.ToString().ToUpper())
            ?.TimestampPowerPairs
            .Where(t => t.Timestamp.Date == currentDay && t.Timestamp <= currentHour);

        return powerUsageData;
    }

    public async Task<double> GetPowerUsageForAMonthSystemConsumer(int direction)
    {
        var startOfMonth = DateTime.Now.AddDays(-DateTime.Now.Day + 1).AddMonths(direction); // pocetak proslog meseca (npr 04.05.)
        var endOfMonth = startOfMonth.AddMonths(1); // (04. 06.)

        var devices = _dataContext.Devices.ToList();

        double powerUsages = 0;
        foreach (var device in devices)
        {
            var userID = _dataContext.Devices
                      .Where(d => d.ID == device.ID)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
               .Where(g => g.ID == _dataContext.DeviceTypes
                   .Where(dt => dt.ID.ToString().ToUpper() == device.DeviceTypeID.ToString().ToUpper())
                   .Select(dt => dt.GroupID)
                   .FirstOrDefault())
               .Select(g => g.Name)
               .FirstOrDefault();


            if (deviceGroupName == "Consumer" && DSOshare == true)
            {
                 powerUsages += mongoCollection.AsQueryable().ToList().Where(dt => dt.ID.ToString().ToUpper() == device.DeviceTypeID.ToString().ToUpper())
                .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfMonth && t.Timestamp <= endOfMonth).Sum(p => p.PowerUsage));
            }
        }     
        return powerUsages;
    }

    public async Task<double> GetPowerUsageForAMonthSystemProducer(int direction)
    {
        var startOfMonth = DateTime.Now.AddDays(-DateTime.Now.Day + 1).AddMonths(direction); // pocetak proslog meseca (npr 04.05.)
        var endOfMonth = startOfMonth.AddMonths(1); // (04. 06.)

        var devices = _dataContext.Devices.ToList();

        double powerUsages = 0;
        foreach (var device in devices)
        {
            var userID = _dataContext.Devices
                      .Where(d => d.ID == device.ID)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
               .Where(g => g.ID == _dataContext.DeviceTypes
                   .Where(dt => dt.ID.ToString().ToUpper() == device.DeviceTypeID.ToString().ToUpper())
                   .Select(dt => dt.GroupID)
                   .FirstOrDefault())
               .Select(g => g.Name)
               .FirstOrDefault();


            if (deviceGroupName == "Producer" && DSOshare == true)
            {
                powerUsages += mongoCollection.AsQueryable().ToList().Where(dt => dt.ID.ToString().ToUpper() == device.DeviceTypeID.ToString().ToUpper())
               .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfMonth && t.Timestamp <= endOfMonth).Sum(p => p.PowerUsage));
            }
        }
        return powerUsages;
    }

    public async Task<List<PowerUsage>> GetPowerUsageSumByDeviceConsumer(int direction)
    {
        var startOfMonth = DateTime.Now.AddMonths(direction);
        var endOfMonth = startOfMonth.AddMonths(1);

        var deviceTypes = mongoCollection.AsQueryable().ToList();

        List<PowerUsage> listPU = new List<PowerUsage>();

        foreach (var device in deviceTypes)
        {
            double sum = 0;
            PowerUsage sums;

            var userID = _dataContext.Devices
                      .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
               .Where(g => g.ID == _dataContext.DeviceTypes
                   .Where(dt => dt.ID.ToString().ToUpper() == device.ID.ToString().ToUpper())
                   .Select(dt => dt.GroupID)
                   .FirstOrDefault())
               .Select(g => g.Name)
               .FirstOrDefault();

            if (deviceGroupName == "Consumer" && DSOshare == true)
            {
                sums = new PowerUsage();
                sums.TimestampPowerPairs = new List<TimestampPowerPair>();
                sums.ID = device.ID;

                var powerUsageData = deviceTypes
                    .Where(p => device.ID.ToString().ToUpper() == p.ID.ToString().ToUpper())
                    .ToList()
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(t => t.Timestamp >= startOfMonth && t.Timestamp <= endOfMonth);

                sum = powerUsageData.Sum(p => p.PowerUsage);

                var tsp = new TimestampPowerPair();
                tsp.PowerUsage = sum;
                sums.TimestampPowerPairs.Add(tsp);
                listPU.Add(sums);
            }
        }

        return listPU;
    }

    public async Task<List<PowerUsage>> GetPowerUsageSumByDeviceProducer(int direction)
    {
        var startOfMonth = DateTime.Now.AddMonths(direction);
        var endOfMonth = startOfMonth.AddMonths(1);

        var deviceTypes = mongoCollection.AsQueryable().ToList();

        List<PowerUsage> listPU = new List<PowerUsage>();

        foreach (var device in deviceTypes)
        {
            double sum = 0;
            PowerUsage sums;

            var userID = _dataContext.Devices
                      .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
               .Where(g => g.ID == _dataContext.DeviceTypes
                   .Where(dt => dt.ID.ToString().ToUpper() == device.ID.ToString().ToUpper())
                   .Select(dt => dt.GroupID)
                   .FirstOrDefault())
               .Select(g => g.Name)
               .FirstOrDefault();

            if (deviceGroupName == "Producer" && DSOshare == true)
            {
                sums = new PowerUsage();
                sums.TimestampPowerPairs = new List<TimestampPowerPair>();
                sums.ID = device.ID;

                var powerUsageData = deviceTypes
                    .Where(p => device.ID.ToString().ToUpper() == p.ID.ToString().ToUpper())
                    .ToList()
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(t => t.Timestamp >= startOfMonth && t.Timestamp <= endOfMonth);

                sum = powerUsageData.Sum(p => p.PowerUsage);

                var tsp = new TimestampPowerPair();
                tsp.PowerUsage = sum;
                sums.TimestampPowerPairs.Add(tsp);
                listPU.Add(sums);
            }
        }

        return listPU;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayConsumptionMonth(int direction)
    {
        var devices = _dataContext.Devices.Select(d => d.ID);

        PowerUsage pu = null;

        foreach (var device in devices)
        {
            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device)
                            .Select(d => d.DeviceTypeID)
                            .FirstOrDefault();

            var userID = _dataContext.Devices
                      .Where(d => d.ID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if( deviceGroupName == "Consumer" && DSOshare == true)
            {
                double sum = 0;
                var pu2 = await GetPowerUsageForAMonth(device, direction);
                if (pu == null)
                {
                    pu = pu2;
                    continue;
                }
                foreach (var tsp in pu2.TimestampPowerPairs)
                {
                    foreach (var y in pu.TimestampPowerPairs)
                    {
                        if (y.Timestamp == tsp.Timestamp)
                            y.PowerUsage += tsp.PowerUsage;
                    }
                }
            }
        }

        return pu;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayConsumptionWeek(int direction)
    {
        var devices = _dataContext.Devices.Select(d => d.ID);

        PowerUsage pu = null;

        foreach (var device in devices)
        {
            var userID = _dataContext.Devices
                      .Where(d => d.ID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device)
                            .Select(d => d.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer" && DSOshare == true)
            {
                double sum = 0;
                var pu2 = await GetPowerUsageFor7Days(device, direction);
                if (pu == null)
                {
                    pu = pu2;
                    continue;
                }
                foreach (var tsp in pu2.TimestampPowerPairs)
                {
                    foreach (var y in pu.TimestampPowerPairs)
                    {
                        if (y.Timestamp == tsp.Timestamp)
                            y.PowerUsage += tsp.PowerUsage;
                    }
                }
            }
        }

        return pu;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayProductionWeek(int direction)
    {
        var devices = _dataContext.Devices.Select(d => d.ID);

        PowerUsage pu = null;

        foreach (var device in devices)
        {
            var userID = _dataContext.Devices
                      .Where(d => d.ID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device)
                            .Select(d => d.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Producer" && DSOshare == true)
            {
                double sum = 0;
                var pu2 = await GetPowerUsageFor7Days(device, direction);
                if (pu == null)
                {
                    pu = pu2;
                    continue;
                }
                foreach (var tsp in pu2.TimestampPowerPairs)
                {
                    foreach (var y in pu.TimestampPowerPairs)
                    {
                        if (y.Timestamp == tsp.Timestamp)
                            y.PowerUsage += tsp.PowerUsage;
                    }
                }
            }
        }

        return pu;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayProduction24h(int direction)
    {
        var devices = _dataContext.Devices.Select(d => d.ID);

        PowerUsage pu = null;

        foreach (var device in devices)
        {
            var userID = _dataContext.Devices
                      .Where(d => d.ID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device)
                            .Select(d => d.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Producer" && DSOshare == true)
            {
                double sum = 0;
                var pu2 = await GetPowerUsageForDevicePast24Hours(device, direction);
                if (pu == null)
                {
                    pu = pu2;
                    continue;
                }
                foreach (var tsp in pu2.TimestampPowerPairs)
                {
                    foreach (var y in pu.TimestampPowerPairs)
                    {
                        if (y.Timestamp == tsp.Timestamp)
                            y.PowerUsage += tsp.PowerUsage;
                    }
                }
            }
        }

        return pu;
    }

    public async Task<PowerUsage> GetPowerUsagesForEachDayConsumption24h(int direction)
    {
        var devices = _dataContext.Devices.Select(d => d.ID);

        PowerUsage pu = null;

        foreach (var device in devices)
        {
            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device)
                            .Select(d => d.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            var userID = _dataContext.Devices
                      .Where(d => d.ID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer" && DSOshare == true)
            {
                double sum = 0;
                var pu2 = await GetPowerUsageForDevicePast24Hours(device, direction);
                if (pu == null)
                {
                    pu = pu2;
                    continue;
                }
                foreach (var tsp in pu2.TimestampPowerPairs)
                {
                    foreach (var y in pu.TimestampPowerPairs)
                    {
                        if (y.Timestamp == tsp.Timestamp)
                            y.PowerUsage += tsp.PowerUsage;
                    }
                }
            }
        }

        return pu;
    }


    public async Task<PowerUsage> GetPowerUsagesForEachDayProductionMonth(int direction)
    {
        var devices = _dataContext.Devices.Select(d => d.ID);

        PowerUsage pu = null;

        foreach (var device in devices)
        {
            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device)
                            .Select(d => d.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            var userID = _dataContext.Devices
                      .Where(d => d.ID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            if (deviceGroupName == "Producer" && DSOshare == true)
            {
                double sum = 0;
                var pu2 = await GetPowerUsageForAMonth(device, direction);
                if (pu == null)
                {
                    pu = pu2;
                    continue;
                }
                foreach (var tsp in pu2.TimestampPowerPairs)
                {
                    foreach (var y in pu.TimestampPowerPairs)
                    {
                        if (y.Timestamp == tsp.Timestamp)
                            y.PowerUsage += tsp.PowerUsage;
                    }
                }
            }
        }

        return pu;
    }


    public async Task<List<PowerUsage>> GetPowerUsageForDevicesConsumption(Guid userID, int direction, int shareData)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();
        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        IEnumerable<String> deviceTypeIds = _deviceRepository.GetDevicesForUser(userID).Select(d => d.DeviceTypeID.ToString().ToUpper());

        List<PowerUsage> puList = new List<PowerUsage>();

        if(deviceTypeIds == null)
        {
            return null;
        }

        PowerUsage pu = new PowerUsage();        
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        
        for (int i = 1; i <= 31; i++)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            var date = DateTime.UtcNow.AddDays(direction * i).Date;
            tsp.Timestamp = date;
            foreach (var deviceType in deviceTypeIds)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if (deviceGroupName == "Consumer")
                {
                    var powerUsageData = mongoCollection.AsQueryable()
                        .Where(p => deviceType.Contains(p.ID.ToString()))
                        .ToList();

                    var powerUsage = powerUsageData
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(tp => tp.Timestamp.Date == date)
                    .Sum(tp => tp.PowerUsage);                 
                    tsp.PowerUsage += powerUsage;
                }
            }
            pu.TimestampPowerPairs.Add(tsp);
        } 

        puList.Add(pu);
        return puList;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesProduction(Guid userID, int direction, int shareData)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        IEnumerable<String> deviceTypeIds = _deviceRepository.GetDevicesForUser(userID).Select(d => d.DeviceTypeID.ToString().ToUpper());

        List<PowerUsage> puList = new List<PowerUsage>();

        if (deviceTypeIds == null)
        {
            return null;
        }

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();

        for (int i = 1; i <= 31; i++)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            var date = DateTime.UtcNow.AddDays(direction * i).Date;
            tsp.Timestamp = date;
            foreach (var deviceType in deviceTypeIds)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if (deviceGroupName == "Producer")
                {
                    var powerUsageData = mongoCollection.AsQueryable()
                        .Where(p => deviceType.Contains(p.ID.ToString()))
                        .ToList();

                    var powerUsage = powerUsageData
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(tp => tp.Timestamp.Date == date)
                    .Sum(tp => tp.PowerUsage);
                    tsp.PowerUsage += powerUsage;
                }
            }
            pu.TimestampPowerPairs.Add(tsp);
        }

        puList.Add(pu);
        return puList;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor7Days(Guid userID, int direction, int shareData)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();
        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        IEnumerable<String> deviceTypeIds = _deviceRepository.GetDevicesForUser(userID).Select(d => d.DeviceTypeID.ToString().ToUpper());
        
        List<PowerUsage> puList = new List<PowerUsage>();

        if (deviceTypeIds == null)
        {
            return null;
        }

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();

        for (int i = 1; i <= 7; i++)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            var date = DateTime.UtcNow.AddDays(direction * i).Date;
            tsp.Timestamp = date;
            foreach (var deviceType in deviceTypeIds)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if (deviceGroupName == "Consumer")
                {
                    var powerUsageData = mongoCollection.AsQueryable()
                        .Where(p => deviceType.Contains(p.ID.ToString()))
                        .ToList();

                    var powerUsage = powerUsageData
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(tp => tp.Timestamp.Date == date)
                    .Sum(tp => tp.PowerUsage);
                    tsp.PowerUsage += powerUsage;
                }
            }
            pu.TimestampPowerPairs.Add(tsp);
        }

        puList.Add(pu);
        return puList;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor7Days(Guid userID, int direction, int shareData)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();
        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        IEnumerable<String> deviceTypeIds = _deviceRepository.GetDevicesForUser(userID).Select(d => d.DeviceTypeID.ToString().ToUpper());

        List<PowerUsage> puList = new List<PowerUsage>();

        if (deviceTypeIds == null)
        {
            return null;
        }

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();

        for (int i = 1; i <= 7; i++)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            var date = DateTime.UtcNow.AddDays(direction * i).Date;
            tsp.Timestamp = date;
            foreach (var deviceType in deviceTypeIds)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if (deviceGroupName == "Producer")
                {
                    var powerUsageData = mongoCollection.AsQueryable()
                        .Where(p => deviceType.Contains(p.ID.ToString()))
                        .ToList();

                    var powerUsage = powerUsageData
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(tp => tp.Timestamp.Date == date)
                    .Sum(tp => tp.PowerUsage);
                    tsp.PowerUsage += powerUsage;
                }
            }
            pu.TimestampPowerPairs.Add(tsp);
        }

        puList.Add(pu);
        return puList;
    }

    public async Task<List<PowerUsage>> GetPowerUsageForDevicesConsumptionFor24Hours(Guid userID, int direction, int shareData)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();
        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        IEnumerable<String> deviceTypeIds = _deviceRepository.GetDevicesForUser(userID).Select(d => d.DeviceTypeID.ToString().ToUpper());

        List<PowerUsage> puList = new List<PowerUsage>();

        if (deviceTypeIds == null)
        {
            return null;
        }

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();

        for (int i = 1; i <= 24; i++)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            var date = DateTime.Now.AddHours(direction * i);
            tsp.Timestamp = date.AddMinutes(date.Minute * -1).AddSeconds(date.Second * -1);
            var dateplus1 = date.AddHours(1);
            foreach (var deviceType in deviceTypeIds)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if (deviceGroupName == "Consumer")
                {
                    var powerUsageData = mongoCollection.AsQueryable()
                        .Where(p => deviceType.Contains(p.ID.ToString()))
                        .ToList();

                    var powerUsage = powerUsageData
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(tp => tp.Timestamp >= date && tp.Timestamp <= dateplus1)
                    .Sum(tp => tp.PowerUsage);
                    tsp.PowerUsage += powerUsage;
                }
            }
            pu.TimestampPowerPairs.Add(tsp);
        }

        puList.Add(pu);
        return puList;
    }
    public async Task<List<PowerUsage>> GetPowerUsageForDevicesProductionFor24Hours(Guid userID, int direction, int shareData)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();
        if(shareData == 0)
        {
            if (DSOshare == false)
             return null;
        }
        

        IEnumerable<String> deviceTypeIds = _deviceRepository.GetDevicesForUser(userID).Select(d => d.DeviceTypeID.ToString().ToUpper());

        List<PowerUsage> puList = new List<PowerUsage>();

        if (deviceTypeIds == null)
        {
            return null;
        }

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();

        for (int i = 1; i <= 24; i++)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            var date = DateTime.Now.AddHours(direction * i);
            tsp.Timestamp = date.AddMinutes(date.Minute * -1).AddSeconds(date.Second * -1);
            var dateplus1 = date.AddHours(1);
            foreach (var deviceType in deviceTypeIds)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if (deviceGroupName == "Producer")
                {
                    var powerUsageData = mongoCollection.AsQueryable()
                        .Where(p => deviceType.Contains(p.ID.ToString()))
                        .ToList();

                    var powerUsage = powerUsageData
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(tp => tp.Timestamp >= date && tp.Timestamp <= dateplus1)
                    .Sum(tp => tp.PowerUsage);
                    tsp.PowerUsage += powerUsage;
                }
            }
            pu.TimestampPowerPairs.Add(tsp);
        }

        puList.Add(pu);
        return puList;
    }

    public async Task<PowerUsage> GetPowerUsageForDevicePast24Hours(Guid deviceID, int direction)
    {
        var utcNow = DateTime.Now;

        PowerUsage pu = new PowerUsage();
        pu.ID = deviceID;
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();

        var startOf24Period = direction > 0
            ? utcNow
            : utcNow.AddHours(-25);

        var endOf24Period = direction > 0 
            ? utcNow.AddHours(24) 
            : utcNow.AddHours(-1);


        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsages = mongoCollection.AsQueryable()
            .Where(p => p.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
            .SelectMany(p => p.TimestampPowerPairs)
            .ToList()
            .Where(t => t.Timestamp >= startOf24Period && t.Timestamp <= endOf24Period)
            .ToList();

        foreach(var powerUsage in powerUsages)
        {
            TimestampPowerPair tsp = new TimestampPowerPair();
            tsp.Timestamp = powerUsage.Timestamp;
            tsp.PowerUsage = powerUsage.PowerUsage;
            pu.TimestampPowerPairs.Add(tsp);
        }

        return pu;
    }

    public async Task<PowerUsage> Get12hoursBefore12hoursAfter(Guid deviceID)
    {
        var moment = DateTime.Now;
        var endOf12 = moment.AddHours(12);
        var startOf12 = moment.AddHours(-12);

        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceID)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();

        var powerUsages = mongoCollection.AsQueryable()
            .Where(p => deviceTypeID.ToString().ToUpper().Contains(p.ID.ToString().ToUpper()))
            .FirstOrDefault();

        if (powerUsages == null)
        {
            return null;
        }

        powerUsage.ID = powerUsages.ID;

        var currentDate = startOf12;

        while (currentDate <= endOf12)
        {
            var ts = new TimestampPowerPair();
            var sum = await GetCurrentPowerUsage(currentDate, powerUsages.ID);
            ts.Timestamp = currentDate;
            ts.PowerUsage = sum;
            powerUsage.TimestampPowerPairs.Add(ts);
            currentDate = currentDate.AddHours(1);
        }


        return powerUsage;
    }

    public async Task<PowerUsage> GetPowerProducedForADaySystem()
    {
        var startOf24Period = DateTime.Today;
        var endOf24Period = DateTime.Now;
        double sum = 0;
        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();

        var devices = _dataContext.Devices.Select(d => d.DeviceTypeID).ToList();

        var currentDate = startOf24Period;

        while (currentDate <= endOf24Period)
        {
            var ts = new TimestampPowerPair();
            foreach (var device in devices)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID.ToString().ToUpper() == device.ToString().ToUpper())
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

                var userID = _dataContext.Devices
                     .Where(d => d.DeviceTypeID == device)
                     .Select(u => u.OwnerID)
                     .FirstOrDefault();

                bool DSOshare = _dataContext.Users
                            .Where(u => u.ID == userID)
                            .Select(sh => sh.sharesDataWithDso)
                            .FirstOrDefault();

                if (deviceGroupName == "Producer" && DSOshare == true)
                {
                    sum += await GetCurrentPowerUsage(currentDate, device);
                }
            }
            ts.Timestamp = currentDate;
            ts.PowerUsage = sum;
            powerUsage.TimestampPowerPairs.Add(ts);
            sum = 0;
            currentDate = currentDate.AddHours(1);
        }

        return powerUsage;
    }
    public async Task<PowerUsage> GetPowerConsumedForADaySystem()
    {
        var startOf24Period = DateTime.Today;
        var endOf24Period = DateTime.Now;
        double sum = 0;
        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();

        var devices = _dataContext.Devices.Select(d => d.DeviceTypeID).ToList();
       
        var currentDate = startOf24Period;
        
        while (currentDate <= endOf24Period)
        {
            var ts = new TimestampPowerPair();
            foreach (var device in devices)
            {
                string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID.ToString().ToUpper() == device.ToString().ToUpper())
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

                var userID = _dataContext.Devices
                      .Where(d => d.DeviceTypeID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

                bool DSOshare = _dataContext.Users
                            .Where(u => u.ID == userID)
                            .Select(sh => sh.sharesDataWithDso)
                            .FirstOrDefault();
                
                if (deviceGroupName == "Consumer" && DSOshare == true)
                {
                    sum += await GetCurrentPowerUsage(currentDate, device);
                }
            }
            ts.Timestamp = currentDate;
            ts.PowerUsage = sum;
            powerUsage.TimestampPowerPairs.Add(ts);
            sum = 0;
            currentDate = currentDate.AddHours(1);
        } 

        return powerUsage;
    }

    public async Task<double> GetCurrentPowerConsumption()
    {
        double powerUsages = 0;
        var startOfAnHour = DateTime.Now.AddHours(-1);
        var endOfAnHour = DateTime.Now;

        var devices = _dataContext.Devices.Select(d => d.DeviceTypeID).ToList();

        foreach (var device in devices)
        {
            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            var userID = _dataContext.Devices
                      .Where(d => d.DeviceTypeID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer" && DSOshare == true)
            {
                powerUsages += mongoCollection.AsQueryable().ToList()
                    .Where(d => d.ID.ToString().ToUpper() == device.ToString().ToUpper())
                    .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfAnHour && t.Timestamp < endOfAnHour).Sum(p => p.PowerUsage));
            }
        }

        return powerUsages;
    }
    public async Task<double> GetCurrentPowerProduction()
    {
        double powerUsages = 0;
        var startOfAnHour = DateTime.Now.AddHours(-1);
        var endOfAnHour = DateTime.Now;

        var devices = _dataContext.Devices.Select(d => d.DeviceTypeID).ToList();

        foreach (var device in devices)
        {    
            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            var userID = _dataContext.Devices
                      .Where(d => d.DeviceTypeID == device)
                      .Select(u => u.OwnerID)
                      .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            if (deviceGroupName == "Producer" && DSOshare == true)
            {
                powerUsages += mongoCollection.AsQueryable().ToList()
                    .Where(d => d.ID.ToString().ToUpper() == device.ToString().ToUpper())
                    .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfAnHour && t.Timestamp < endOfAnHour).Sum(p => p.PowerUsage));
            }
        }

        return powerUsages;
    }

   
    public async Task<double> GetCurrentPowerUsage(DateTime date,Guid deviceTypeID)
    {
        var startOfAnHour = date;
        var endOfAnHour = date.AddHours(1);

        var deviceUsages = mongoCollection.AsQueryable().Where(p => p.ID.ToString() == deviceTypeID.ToString().ToUpper()).ToList();

        var powerUsages = deviceUsages
            .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfAnHour && t.Timestamp < endOfAnHour).Sum(p => p.PowerUsage));

        return powerUsages;
    }

    public async Task<double> GetCurrentPowerUsage(DateTime date)
    {
        var startOfAnHour = date;
        var endOfAnHour = date.AddHours(1);

        var deviceUsages = mongoCollection.AsQueryable().ToList();

        var powerUsages = deviceUsages
            .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfAnHour && t.Timestamp < endOfAnHour).Sum(p => p.PowerUsage));

        return powerUsages;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsage24Consumption(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

        if (DSOshare == false)
            return null;

        var deviceTypes = _deviceRepository.GetDevicesForUser(userID).Select(p => p.DeviceTypeID);

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        DateTime endTime = DateTime.Now;
        DateTime startTime = endTime.AddDays(-1);
        DateTime currentTime = startTime;

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        foreach(var device in deviceTypes)
        {

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();
            if(deviceGroupName == "Consumer")
            {
                while (currentTime <= endTime)
                {
                    double powerUsageSum = await GetCurrentPowerUsage(currentTime, device);
                    if (powerUsageSum > maxPowerUsage)
                    {
                        maxPowerUsage = powerUsageSum;
                        maxDeviceID = device;
                    }

                    currentTime = currentTime.AddHours(1);
                }
            }
        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsage24Production(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

        if (DSOshare == false)
            return null;

        var deviceTypes = _deviceRepository.GetDevicesForUser(userID).Select(p => p.DeviceTypeID);

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        DateTime endTime = DateTime.Now;
        DateTime startTime = endTime.AddDays(-1);
        DateTime currentTime = startTime;

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        foreach (var device in deviceTypes)
        {

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();
            if (deviceGroupName == "Producer")
            {
                while (currentTime <= endTime)
                {
                    double powerUsageSum = await GetCurrentPowerUsage(currentTime, device);
                    if (powerUsageSum > maxPowerUsage)
                    {
                        maxPowerUsage = powerUsageSum;
                        maxDeviceID = device;
                    }

                    currentTime = currentTime.AddHours(1);
                }
            }
        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousWeekProduction(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return null;


        var deviceTypes = _deviceRepository.GetDevicesForUser(userID).Select(p => p.DeviceTypeID);

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        DateTime endDate = DateTime.Now;
        DateTime startDate = endDate.AddDays(-7);
        DateTime currentTime = startDate;

        foreach (var device in deviceTypes)
        {

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if(deviceGroupName == "Producer")
            {
                var powerUsageData = mongoCollection.AsQueryable().Where(d => d.ID.ToString().ToUpper() == device.ToString().ToUpper())
                                                                   .SelectMany(d => d.TimestampPowerPairs)
                                                                   .ToList()
                                                                   .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate);

                var maxPU = powerUsageData.Max(d => d.PowerUsage);

                if (maxPU > maxPowerUsage)
                {
                    maxPowerUsage = maxPU;
                    maxDeviceID = device;
                }
            }

        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousWeekConsumption(Guid userID)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return null;

        var deviceTypes = _deviceRepository.GetDevicesForUser(userID).Select(p => p.DeviceTypeID);

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        DateTime endDate = DateTime.Now;
        DateTime startDate = endDate.AddDays(-7);
        DateTime currentTime = startDate;

        foreach (var device in deviceTypes)
        {

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer")
            {
                var powerUsageData = mongoCollection.AsQueryable().Where(d => d.ID.ToString().ToUpper() == device.ToString().ToUpper())
                                                                  .SelectMany(d => d.TimestampPowerPairs)
                                                                  .ToList()
                                                                  .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate);

                var maxPU = powerUsageData.Max(d => d.PowerUsage);

                if (maxPU > maxPowerUsage)
                {
                    maxPowerUsage = maxPU;
                    maxDeviceID = device;
                }
            }

        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousMonthConsumption(Guid userID, int direction) // ubacen direction da diktira koliko meseci ide unazad (direction => broj meseci)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return null;

        DateTime endDate = DateTime.Now;
        DateTime startDate = endDate.AddMonths( direction );

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        var devices = _deviceRepository.GetDevicesForUser(userID).Select(dt => dt.DeviceTypeID).Distinct();

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;


        foreach (var device in devices)
        {

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            DateTime currentTime = startDate;

            if(deviceGroupName == "Consumer")
            {

                var powerUsageData = mongoCollection.AsQueryable().Where(d => d.ID.ToString().ToUpper() == device.ToString().ToUpper())
                                                                  .SelectMany(d => d.TimestampPowerPairs)
                                                                  .ToList()
                                                                  .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate);

                var maxPU = powerUsageData.Max(d => d.PowerUsage);

                if (maxPU > maxPowerUsage)
                {
                    maxPowerUsage = maxPU;
                    maxDeviceID = device;
                }


            }
        }

           pu.ID = maxDeviceID;
           tsp.PowerUsage = maxPowerUsage;
           pu.TimestampPowerPairs.Add(tsp);

           return pu;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsagePreviousMonthProduction(Guid userID, int direction)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return null;

        DateTime endDate = DateTime.Now;
        DateTime startDate = endDate.AddMonths( -1 * direction );

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        var devices = _deviceRepository.GetDevicesForUser(userID).Select(dt => dt.DeviceTypeID);

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        foreach (var device in devices)
        {

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == device)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            DateTime currentTime = startDate;

            if (deviceGroupName == "Producer")
            {
                var powerUsageData = mongoCollection.AsQueryable().Where(d => d.ID.ToString().ToUpper() == device.ToString().ToUpper())
                                                                  .SelectMany(d => d.TimestampPowerPairs)
                                                                  .ToList()
                                                                  .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate);

                var maxPU = powerUsageData.Max(d => d.PowerUsage);

                if (maxPU > maxPowerUsage)
                {
                    maxPowerUsage = maxPU;
                    maxDeviceID = device;
                }
            }
        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;
    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsageCurrentProduction(Guid userID,int shareData)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        DateTime endHour = DateTime.UtcNow;
        DateTime startHour = endHour.AddHours(-1);

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        foreach (var device in devices)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceTypeID)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if(deviceGroupName == "Producer")
            {
                double powerUsageSum = await GetCurrentPowerUsage(startHour, deviceTypeID);

                if (powerUsageSum > maxPowerUsage)
                {
                    maxPowerUsage = powerUsageSum;
                    maxDeviceID = device.ID;
                }
            }
        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;

    }

    public async Task<PowerUsage> GetDeviceWithMaxPowerUsageCurrentConsumption(Guid userID, int shareData)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();
        if (shareData == 0)
        {
            if (DSOshare == false)
                return null;
        }
        else DSOshare = true;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        DateTime endHour = DateTime.UtcNow;
        DateTime startHour = endHour.AddHours(-1);

        PowerUsage pu = new PowerUsage();
        pu.TimestampPowerPairs = new List<TimestampPowerPair>();
        TimestampPowerPair tsp = new TimestampPowerPair();

        var maxDeviceID = Guid.Empty;
        double maxPowerUsage = 0;

        foreach (var device in devices)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceTypeID)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer" && device.IsOn == true)
            {
                double powerUsageSum = await GetCurrentPowerUsage(startHour, deviceTypeID);

                if (powerUsageSum > maxPowerUsage)
                {
                    maxPowerUsage = powerUsageSum;
                    maxDeviceID = device.ID;
                }
            }
        }

        pu.ID = maxDeviceID;
        tsp.PowerUsage = maxPowerUsage;
        pu.TimestampPowerPairs.Add(tsp);

        return pu;

    }
    public async Task<double> GetHowMuchUserIsConsuming(Guid userId)
    {
        bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userId)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return 0;

        var userDevices = _deviceRepository.GetDevicesForUser(userId).Select(d => d.DeviceTypeID);
        double maximumConsumption = 0;
        foreach (var userdevice in userDevices)
        {
            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == userdevice)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer")
            {
                maximumConsumption += _dataContext.DeviceTypes.Where(d => d.ID == userdevice).Sum(d => d.Wattage);
            }
        }

        var currentUserConsumption = await this.CurrentSumPowerUsageConsumption(userId);


        var savedEnergy = ((maximumConsumption - currentUserConsumption) / maximumConsumption) * 100;

        return savedEnergy;
    }

    public async Task<double> deviceEnergySaved(Guid deviceID)
    {
        DateTime previousHour = DateTime.Now.AddHours(-2);
        DateTime thisHour = DateTime.Now.AddHours(-1);

        Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == deviceID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

        double previousHourPowerUsage = await GetCurrentPowerUsage(previousHour, deviceTypeID);
        Console.WriteLine("PROSLI SAT " + previousHourPowerUsage);
        double thisHourPowerUsage = await GetCurrentPowerUsage(thisHour, deviceTypeID);
        Console.WriteLine("TRENUTNI SAT " + thisHourPowerUsage);

        return (previousHourPowerUsage - thisHourPowerUsage) / 100;
    }

    public async Task<double> SavedEnergySystemProducer()
    {
        var lastMonth = await this.GetPowerUsageForAMonthSystemProducer(-2);
        var thisMonth = await this.GetPowerUsageForAMonthSystemProducer(-1);

        var savedEnergy = ((lastMonth - thisMonth) / lastMonth) * 100;

        return savedEnergy;
    }

    public async Task<double> SavedEnergySystemConsumer()
    {
        var lastMonth = await this.GetPowerUsageForAMonthSystemConsumer(-2);
        var thisMonth = await this.GetPowerUsageForAMonthSystemConsumer(-1);

        var savedEnergy = ((lastMonth - thisMonth) / lastMonth) * 100;

        return savedEnergy;
    }

    public async Task<double> savedEnergyForUserConsumer(Guid userID, int direction)
    {
       /* bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();
        if (shareData == 0)
        {
            if (DSOshare == false)
                return 0;
        }
        else DSOshare = true;*/
        

        DateTime endDate = DateTime.Now;
        DateTime startDate = DateTime.Now;

        if (direction == 1)
        {
            endDate = DateTime.Now;
            startDate = endDate.AddMonths(-1);
        }

        if (direction == 2)
        {
            endDate = DateTime.Now.AddMonths(-1);
            startDate = endDate.AddMonths(-1);
        }

        if (direction == 3)
        {
            endDate = DateTime.Now;
            startDate = endDate.AddDays(-endDate.Day + 1).Date;
        }


        double sum = 0;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        foreach(var device in devices)
        {
            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device.ID)
                            .Select(dt => dt.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if(deviceGroupName == "Consumer")
            {
                var powerUsages = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .ToList()
                    .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate)
                    .ToList();

                foreach(var powerUsage in powerUsages)
                {
                    sum += powerUsage.PowerUsage;
                }
            }
        }

        return sum;
    }

    public async Task<double> savedEnergyForUserProducer(Guid userID, int direction)
    {
       /* bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return 0;*/

        DateTime endDate = DateTime.Now;
        DateTime startDate = DateTime.Now;

        if (direction == 1)
        {
            endDate = DateTime.Now;
            startDate = endDate.AddMonths(-1);
        }

        if (direction == 2)
        {
            endDate = DateTime.Now.AddMonths(-1);
            startDate = endDate.AddMonths(-1);
        }
        if (direction == 3)
        {
            endDate = DateTime.Now;
            startDate = endDate.AddDays(-endDate.Day + 1).Date;
        }

        double sum = 0;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        foreach (var device in devices)
        {
            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device.ID)
                            .Select(dt => dt.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Producer")
            {
                var powerUsages = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .ToList()
                    .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate)
                    .ToList();

                foreach (var powerUsage in powerUsages)
                {
                    sum += powerUsage.PowerUsage;
                }
            }
        }

        return sum;
    }

    public async Task<double> savedEnergyForUserConsumer(Guid userID)
    {
       /* bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return 0;*/

        var previousMonth = await savedEnergyForUserConsumer(userID, 2);
        var thisMonth = await savedEnergyForUserConsumer(userID, 1);

        var savedEnergy = ((previousMonth - thisMonth) / previousMonth) * 100;

        return savedEnergy;
    }

    public async Task<double> savedEnergyForUserProducer(Guid userID)
    {
       /* bool DSOshare = _dataContext.Users
                       .Where(u => u.ID == userID)
                       .Select(sh => sh.sharesDataWithDso)
                       .FirstOrDefault();

        if (DSOshare == false)
            return 0;*/

        var previousMonth = await savedEnergyForUserProducer(userID, 2);
        var thisMonth = await savedEnergyForUserProducer(userID, 1);

        var savedEnergy = ((previousMonth - thisMonth) / previousMonth) * 100;

        return savedEnergy;
    }

    public async Task<PowerUsage> GetPowerUsageForAMonthConsumption(Guid deviceId, int direction)
    {
        Guid deviceTypeID = _dataContext.Devices
            .Where(d => d.ID == deviceId)
            .Select(d => d.DeviceTypeID)
            .FirstOrDefault();

        var powerUsage = new PowerUsage();
        powerUsage.TimestampPowerPairs = new List<TimestampPowerPair>();
        var today = DateTime.Today;

        for (int i = 1; i <= 31; i++)
        {
            var day = today.AddDays(i * direction);
            var powerUsageD = await GetPowerUsageForDay(deviceId, day);
            var ts = new TimestampPowerPair();
            ts.PowerUsage = powerUsageD;
            ts.Timestamp = day;
            powerUsage.TimestampPowerPairs.Add(ts);

        }

        if (direction == -1)
            powerUsage.TimestampPowerPairs.Reverse();

        return powerUsage;
    }



    public async Task<double> percentPowerUsageForPreviousHour(Guid deviceID)
    {
        DateTime date = DateTime.Now.AddHours(-1);

        Guid deviceTypeID = _dataContext.Devices
                .Where(d => d.ID == deviceID)
                .Select(d => d.DeviceTypeID)
                .FirstOrDefault();

        double previousHourSystemUsage = 0;
        double previopusHourDeviceUsage = await this.GetCurrentPowerUsage(date, deviceTypeID);

        string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID == deviceTypeID)
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();

        if(deviceGroupName == "Producer")
            previousHourSystemUsage = await this.CurrentSumPowerUsageSystemProducer();
        if (deviceGroupName == "Consumer")
            previousHourSystemUsage = await this.CurrentSumPowerUsageSystemConsumer();

        return (previopusHourDeviceUsage / previousHourSystemUsage) * 100;
    }

    public async Task<double> percentPowerUsageDifferenceForPreviousHourConsumption(Guid userId)
    {
        double currentConsumption = await this.CurrentSumPowerUsageConsumption(userId);

        double sum = 0;
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour).AddHours(-1);

        var devicesTypes = _deviceRepository.GetDevicesForUser(userId);
        foreach (var device in devicesTypes)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();

            if (deviceGroupName == "Consumer")
            {
                var powerUsageData = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .ToList()
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(t => t.Timestamp == currentHourTimestamp);

                sum += powerUsageData.Sum(p => p.PowerUsage);
            }
        }
        return ((currentConsumption - sum) / sum) * 100;
    }

    public async Task<double> percentPowerUsageDifferenceForPreviousHourProduction(Guid userId)
    {
        double currentConsumption = await this.CurrentSumPowerUsageProduction(userId);

        double sum = 0;
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour).AddHours(-1);

        var devicesTypes = _deviceRepository.GetDevicesForUser(userId);
        foreach (var device in devicesTypes)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                .Where(g => g.ID == _dataContext.DeviceTypes
                    .Where(dt => dt.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .Select(dt => dt.GroupID)
                    .FirstOrDefault())
                .Select(g => g.Name)
                .FirstOrDefault();

            if (deviceGroupName == "Producer")
            {
                var powerUsageData = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceTypeID.ToString().ToUpper())
                    .ToList()
                    .SelectMany(p => p.TimestampPowerPairs)
                    .Where(t => t.Timestamp == currentHourTimestamp);

                sum += powerUsageData.Sum(p => p.PowerUsage);
            }
        }
        return ((currentConsumption - sum) / sum) * 100;
    }

    public async Task<double> electricityBillCurrentMonth(Guid userID, double electricityRate) 
    {
        DateTime endDate = DateTime.Now;
        DateTime startDate = new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);

        double sum = 0;

        var devices = _deviceRepository.GetDevicesForUser(userID);

        foreach (var device in devices)
        {
            var deviceType = _dataContext.Devices
                            .Where(d => d.ID == device.ID)
                            .Select(dt => dt.DeviceTypeID)
                            .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
                        .Where(g => g.ID == _dataContext.DeviceTypes
                            .Where(dt => dt.ID == deviceType)
                            .Select(dt => dt.GroupID)
                            .FirstOrDefault())
                        .Select(g => g.Name)
                        .FirstOrDefault();

            if (deviceGroupName == "Consumer")
            {
                var powerUsages = mongoCollection.AsQueryable()
                    .Where(p => p.ID.ToString().ToUpper() == deviceType.ToString().ToUpper())
                    .SelectMany(p => p.TimestampPowerPairs)
                    .ToList()
                    .Where(t => t.Timestamp >= startDate && t.Timestamp <= endDate)
                    .ToList();

                foreach (var powerUsage in powerUsages)
                {
                    sum += powerUsage.PowerUsage;
                }
            }
        }

        return sum * electricityRate;
    }

    public async Task<double> electricityBillLastMonth(Guid userID, double electricityRate)
    {
        double currentConsumption = this.CurrentSumPowerUsageSystemProducer().Result;

        DateTime currentHourTimestamp = DateTime.Now.AddHours(-2);
        double sum = 0;

        var powerUsageData = mongoCollection.AsQueryable()
           .Select(d => d.ID)
           .ToList();

        foreach (var device in powerUsageData)
        {
            Guid userIDD = _dataContext.Devices
                        .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                        .Select(u => u.OwnerID)
                        .FirstOrDefault();
            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userIDD)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
           .Where(g => g.ID == _dataContext.DeviceTypes
               .Where(dt => dt.ID == device)
               .Select(dt => dt.GroupID)
               .FirstOrDefault())
           .Select(g => g.Name)
           .FirstOrDefault();

            bool isOn = _dataContext.Devices
                    .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                    .Select(ison => ison.IsOn)
                    .FirstOrDefault();

            if (DSOshare == true && deviceGroupName == "Producer" && isOn == true)
            {
                sum += GetCurrentPowerUsage(currentHourTimestamp, device).Result;
            }
        }
        return ((currentConsumption - sum) / sum) * 100;
    }
    public double PercentPowerUsageDifferenceForPreviousHourConsumptionSystem()
    {
        double currentConsumption = this.CurrentSumPowerUsageSystemConsumer().Result;
                
        DateTime currentHourTimestamp = DateTime.Now.AddHours(-2);
        double sum = 0;

        var powerUsageData = mongoCollection.AsQueryable()
           .Select(d => d.ID)
           .ToList();

        foreach (var device in powerUsageData)
        {
            var userID = _dataContext.Devices
                       .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                       .Select(u => u.OwnerID)
                       .FirstOrDefault();

            bool DSOshare = _dataContext.Users
                        .Where(u => u.ID == userID)
                        .Select(sh => sh.sharesDataWithDso)
                        .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
           .Where(g => g.ID == _dataContext.DeviceTypes
               .Where(dt => dt.ID == device)
               .Select(dt => dt.GroupID)
               .FirstOrDefault())
           .Select(g => g.Name)
           .FirstOrDefault();

            bool isOn = _dataContext.Devices
                    .Where(d => d.DeviceTypeID.ToString().ToUpper() == device.ToString().ToUpper())
                    .Select(ison => ison.IsOn)
                    .FirstOrDefault();

            if (DSOshare == true && deviceGroupName == "Consumer" && isOn == true)
            {
                sum += GetCurrentPowerUsage(currentHourTimestamp, device).Result;
            }
        }        
        return ((currentConsumption - sum) / sum) * 100;
    }

    public double ElectricityBillForCurrentMonth(Guid userID, double electricityRate)
    {
        var consumes = savedEnergyForUserConsumer(userID, 3);

        return consumes.Result * electricityRate;
    }

    public async Task<double> electricityBill2MonthsAgo(Guid userID, double electricityRate)
    {
        bool DSOshare = _dataContext.Users
            .Where(u => u.ID == userID)
            .Select(sh => sh.sharesDataWithDso)
            .FirstOrDefault();

        if (DSOshare == false)
            return 0;

        var consumes = await savedEnergyForUserConsumer(userID, 2);

        return consumes * electricityRate;
    }
    public double electricityEarningsForCurrentMonth(Guid userID, double electricityRate)
    {
        var consumes = savedEnergyForUserProducer(userID, 3);

        return consumes.Result * electricityRate;
    }

    public async Task<double> electricityEarningsLastMonth(Guid userID, double electricityRate)
    {
        bool DSOshare = _dataContext.Users
            .Where(u => u.ID == userID)
            .Select(sh => sh.sharesDataWithDso)
            .FirstOrDefault();

        if (DSOshare == false)
            return 0;

        var consumes = await savedEnergyForUserProducer(userID, 1);

        return consumes * electricityRate;
    }

    public async Task<double> electricityEarnings2MonthsAgo(Guid userID, double electricityRate)
    {
        bool DSOshare = _dataContext.Users
            .Where(u => u.ID == userID)
            .Select(sh => sh.sharesDataWithDso)
            .FirstOrDefault();

        if (DSOshare == false)
            return 0;

        var consumes = await savedEnergyForUserProducer(userID, 2);

        return consumes * electricityRate;
    }

    public async Task UpdateBatteries()
    {
        var batteries = _dataContext.BatteryConnections
                        .Select(e => e.BatteryID)
                        .Distinct()
                        .ToList();
        
        foreach (var battery in batteries)
        {
            double sumProduction = 0;
            double sumConsumption = 0;
            var devices = _dataContext.BatteryConnections
                            .Where(e => e.BatteryID == battery)
                            .Select(e => e.Device.ID)
                            .ToList();

            
            foreach (var device in devices)
            {
                Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

                string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID == deviceTypeID)
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

                if(deviceGroupName == "Producer")
                {
                    var deviceStatus = _dataContext.Devices.FirstOrDefaultAsync(u => u.ID == device).Result.IsOn;
                    if(deviceStatus == true)
                    {
                        sumProduction += await this.GetCurrentPowerProduction(device);
                    }                    
                }
                else if(deviceGroupName == "Consumer")
                {
                    var deviceStatus = _dataContext.Devices.FirstOrDefaultAsync(u => u.ID == device).Result.IsOn;
                    if (deviceStatus == true)
                    {
                        sumConsumption += await this.GetCurrentPowerConsumption(device);
                    }
                }                
            }

            var batteryTemp = _dataContext.Devices
                              .Include(e => e.DeviceType)
                              .Where(e => e.ID == battery)
                              .Select(d => d.DeviceType.Wattage)
                              .First();                           
                              

            BatteryStatus temp = await _dataContext.BatteryStatuses
                                       .Where(e => e.Date == DateTime.Now.Date.AddHours(DateTime.Now.Hour-1))
                                       .FirstOrDefaultAsync(b => b.ID == battery);

            double percentChange= (((sumProduction-sumConsumption) * 1000) * 100) / batteryTemp;

            if(temp == null)
            {
                temp = new BatteryStatus();
                temp.ID = battery;
                temp.Date = DateTime.Now.Date.AddHours(DateTime.Now.Hour);
                temp.BatteryPercent = 0;
            }
            temp.BatteryPercent += percentChange;
            temp.Date = DateTime.Now.Date.AddHours(DateTime.Now.Hour);

            _dataContext.BatteryStatuses.Add(temp);
            await _dataContext.SaveChangesAsync();
            
        }
    }

    public async Task<double> GetBatteryPercentage(Guid deviceID)
    {
        var currentHourTimestamp = DateTime.UtcNow;
        var batteryPercent = await _dataContext.BatteryStatuses.FirstOrDefaultAsync(e => e.ID == deviceID && e.Date == currentHourTimestamp);
        if(batteryPercent == null)
        {
            return 0;
        }
        return batteryPercent.BatteryPercent;
    }
    
    public async Task<double> GetCurrentPowerProduction(Guid deviceID)
    {
        double powerUsages = 0;
        var startOfAnHour = DateTime.Now.AddHours(-1);
        var endOfAnHour = DateTime.Now;

        var device = _dataContext.Devices.FirstOrDefaultAsync(e => e.ID == deviceID);        
        
        string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID == device.Result.DeviceTypeID)
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

        var userID = _dataContext.Devices
                    .Where(d => d.DeviceTypeID == device.Result.DeviceTypeID)
                    .Select(u => u.OwnerID)
                    .FirstOrDefault();
                
        if (deviceGroupName == "Producer")
        {
            powerUsages += mongoCollection.AsQueryable().ToList()
                .Where(d => d.ID.ToString().ToUpper() == device.Result.DeviceTypeID.ToString().ToUpper())
                .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfAnHour && t.Timestamp < endOfAnHour).Sum(p => p.PowerUsage));
        }
        

        return powerUsages;
    }

    public async Task<double> GetCurrentPowerConsumption(Guid deviceID)
    {
        double powerUsages = 0;
        var startOfAnHour = DateTime.Now.AddHours(-1);
        var endOfAnHour = DateTime.Now;

        var device = _dataContext.Devices.FirstOrDefaultAsync(e => e.ID == deviceID);

        string deviceGroupName = _dataContext.DeviceGroups
                    .Where(g => g.ID == _dataContext.DeviceTypes
                        .Where(dt => dt.ID == device.Result.DeviceTypeID)
                        .Select(dt => dt.GroupID)
                        .FirstOrDefault())
                    .Select(g => g.Name)
                    .FirstOrDefault();

        var userID = _dataContext.Devices
                    .Where(d => d.DeviceTypeID == device.Result.DeviceTypeID)
                    .Select(u => u.OwnerID)
                    .FirstOrDefault();

        if (deviceGroupName == "Consumer")
        {
            powerUsages += mongoCollection.AsQueryable().ToList()
                .Where(d => d.ID.ToString().ToUpper() == device.Result.DeviceTypeID.ToString().ToUpper())
                .Sum(p => p.TimestampPowerPairs.Where(t => t.Timestamp >= startOfAnHour && t.Timestamp < endOfAnHour).Sum(p => p.PowerUsage));
        }


        return powerUsages;
    }

    public async Task<double> GetForUserBatteryPower(Guid userID)
    {
        DateTime currentHourTimestamp = DateTime.Now.Date.AddHours(DateTime.Now.Hour);
        double batteryPower = 0;
        var devices = _dataContext.Devices
                        .Where(d => d.OwnerID == userID)
                        .ToList();

        foreach (var device in devices)
        {
            Guid deviceTypeID = _dataContext.Devices
               .Where(d => d.ID == device.ID)
               .Select(d => d.DeviceTypeID)
               .FirstOrDefault();

            string deviceGroupName = _dataContext.DeviceGroups
           .Where(g => g.ID == _dataContext.DeviceTypes
               .Where(dt => dt.ID == deviceTypeID)
               .Select(dt => dt.GroupID)
               .FirstOrDefault())
           .Select(g => g.Name)
           .FirstOrDefault();

            if (deviceGroupName == "Storage")
            {
                var battery = await _dataContext.BatteryStatuses.FirstOrDefaultAsync(e => e.ID == device.ID && e.Date == currentHourTimestamp);
                if (battery == null)
                {
                    return 0;
                }
                var batteryCapacity = await _dataContext.Devices
                                    .Include(d => d.DeviceType)
                                    .ThenInclude(dt => dt.Manufacturer)
                                    .Include(d => d.DeviceType)
                                    .ThenInclude(dt => dt.Group)
                                    .Where(d => d.ID == device.ID)
                                    .Select(d => d.DeviceType.Wattage)
                                    .FirstOrDefaultAsync();
                var batteryPercent = _dataContext.BatteryStatuses.FirstOrDefaultAsync(e => e.ID == device.ID && e.Date == currentHourTimestamp).Result.BatteryPercent;
                batteryPower += batteryCapacity * (batteryPercent / 100);
            }
        }
        return batteryPower;

    }
}