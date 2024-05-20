using System;
using MongoDB.Bson.Serialization.Attributes;

namespace prosumerAppBack.Models;

public class TimestampPowerPair
    {
        [BsonElement("timestamp")]
        public DateTime Timestamp { get; set; }
        [BsonElement("power_usage")]
        public double PowerUsage { get; set; }
    }