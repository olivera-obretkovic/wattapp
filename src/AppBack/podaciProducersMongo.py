import json
import random
import uuid
from datetime import datetime, timedelta

# Define the average power production of each device in watts
average_power_productions = {
    "power": [
        {
            "id": "A2D2D5EC-B064-4F72-9E0E-84C1171CC14D",
            "name": "Solar Panel",
            "average_power_production": 5,
            "peak_hours": [10, 11, 12, 13, 14, 15, 16, 17]
        },
        {
            "id": "A2D2D5EC-B064-4F72-9E0E-84C1171CC14F",
            "name": "Solar Panel",
            "average_power_production": 7,
            "peak_hours": [10, 11, 12, 13, 14, 15, 16, 17]
        },
        {
            "id": "696E9069-6BAC-47E4-A7C2-8C4779ED33BA",
            "name": "Wind Turbine",
            "average_power_production": 2,
            "peak_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16]
        },
        {
            "id": "696E9069-6BAC-47E4-A7C2-8C4779ED33BB",
            "name": "Wind Turbine",
            "average_power_production": 3,
            "peak_hours": [8, 9, 10, 11, 12, 13, 14, 15, 16]
        }
    ]
}

# Define the start and end dates for the simulation (one year)
start_date = datetime(year=2023, month=1, day=1)
end_date = datetime(year=2023, month=12, day=31)

# Create a list to store the power production data for each device
power_production_data = []

# Simulate power production for each device
for device in average_power_productions['power']:
    # Get the average power production for the current device
    average_power_production = device['average_power_production']
    peak_hours = device['peak_hours']

    # Generate a list of timestamp and power production pairs for the year
    timestamp_power_pairs = []
    current_date = start_date
    while current_date <= end_date:

        # Loop over all 24 hours of the day, generating a timestamp-power production pair for each hour
        for i in range(24):
            # Check if the device is off during this hour
            is_off = False
            if i not in peak_hours or random.random() < 0.2:
                is_off = True

            # If the device is off during this hour, set the power production to 0
            if is_off:
                timestamp_power_pairs.append({"timestamp": current_date.replace(hour=i, minute=0, second=0, microsecond=0).isoformat(), "power_usage": 0})
            else:
                # Add some random variation to the power production (between -10% and +10%)
                power_production = average_power_production * random.uniform(0.3, 1.7)

                # Add the timestamp and power production pair to the list
                timestamp_power_pairs.append({"timestamp": current_date.replace(hour=i, minute=0, second=0, microsecond=0).isoformat(), "power_usage": power_production / 24})

        # Move to the next day
        current_date += timedelta(days=1)

    # Add the dictionary with device id and timestamp/power production pairs to the power production data list
    power_production_data.append({"device_id": device['id'],"timestamp_power_pairs": timestamp_power_pairs})

# Write the power production data to a JSON file
with open("power_production_data_prediction.json", "w") as f:
    json.dump(power_production_data, f, indent=2)

print("Power production data generated and saved to power_production_data_prediction.json")
