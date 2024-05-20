import json
import random
import uuid
from datetime import datetime, timedelta

# Define the average power usage of each appliance in watts
average_power_usages = {
    "power": [
  {
    "id": "9D3D39B2-56D8-44E7-8AD5-B64EFC6784FE",
    "name": "Washing Machine",
    "power_usage": 4
  },
  {
    "id": "D3105304-6EC5-4AED-9B53-9C7EF8E81C4C",
    "name": "Oven",
    "power_usage": 7
  },
  {
    "id": "73E8B43E-BFAF-4DB9-9F36-CF40CC057A6C",
    "name": "Refrigerator",
    "power_usage": 1
  },
  {
    "id": "815F9D3E-F0F8-4E0D-9B6E-9043293BEE9D",
    "name": "Dishwasher",
    "power_usage": 5
  },
  {
    "id": "1AC7203E-B15C-47CE-BC23-08B5B62D225E",
    "name": "Dryer",
    "power_usage": 4
  },
  {
    "id": "0BDA9B57-DF0E-485E-B209-409B26F046E0",
    "name": "Cooker Hood",
    "power_usage": 0.1
  },
  {
    "id": "06BAAAD5-80B8-446B-9480-948E8BA9D52B",
    "name": "Microwave",
    "power_usage": 0.8
  },
  {
    "id": "1435A6E0-FE87-4B65-90F2-CAB08ABC51FC",
    "name": "Freezer",
    "power_usage": 1.2
  },
  {
    "id": "DA04E45D-559B-4B24-B20B-2D7335DB2CF0",
    "name": "Range",
    "power_usage": 8
  },
  {
    "id": "311175CE-F67C-4F5B-B96C-A11243534F3F",
    "name": "Washing Machine",
    "power_usage": 1
  },
  {
    "id": "783D8BD7-725B-42B6-A76B-6E9AD0FCA6DA",
    "name": "Refrigerator",
    "power_usage": 1.9
  },
  {
    "id": "32EA7105-F582-4441-AE81-B738C4284F7E",
    "name": "Dishwasher",
    "power_usage": 2
  },
  {
    "id": "F2F9BE26-5C5F-43E1-AA2F-8E64960D03DD",
    "name": "Dryer",
    "power_usage": 5
  }
    ]
}

# Define the start and end dates for the simulation (one year)
start_date = datetime(year=2023, month=1, day=1)
end_date = datetime(year=2023, month=12, day=31)

# Create a list to store the power usage data for each device
power_usage_data = []

# Simulate power usage for each appliance
for appliance in average_power_usages['power']:
    # Get the average power usage for the current appliance
    average_power_usage = appliance['power_usage']

    # Generate a list of timestamp and power usage pairs for the year
    timestamp_power_pairs = []
    current_date = start_date
    while current_date <= end_date:

        # Loop over all 24 hours of the day, generating a timestamp-power usage pair for each hour
        for i in range(24):
            # Check if the device is off during this hour
            is_off = False
            for start_off_period in range(0, 24, 6):
                if i >= start_off_period and i < start_off_period+6 and random.random() < 0.2:
                    is_off = True
                    break

            # If the device is off during this hour, set the power usage to 0
            if is_off:
                timestamp_power_pairs.append({"timestamp": current_date.replace(hour=i, minute=0, second=0, microsecond=0).isoformat(), "power_usage": 0})
            else:
                # Add some random variation to the power usage (between -10% and +10%)
                power_usage = average_power_usage * random.uniform(0.3, 1.7)

                # Add the timestamp and power usage pair to the list
                timestamp_power_pairs.append({"timestamp": current_date.replace(hour=i, minute=0, second=0, microsecond=0).isoformat(), "power_usage": power_usage / 24})

        # Move to the next day
        current_date += timedelta(days=1)

    # Add the dictionary with device id and timestamp/power usage pairs to the power usage data list
    power_usage_data.append({"device_id": appliance['id'],"timestamp_power_pairs": timestamp_power_pairs})

# Write the power usage data to a JSON file
with open("power_usage_data_prediction.json", "w") as f:
    json.dump(power_usage_data, f, indent=2)

print("Power usage data generated and saved to power_usage_data.json")
