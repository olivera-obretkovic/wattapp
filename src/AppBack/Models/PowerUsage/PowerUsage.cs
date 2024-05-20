using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace prosumerAppBack.Models
{
	public class PowerUsage
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string MongoId { get; set; }

        [BsonElement("device_id")] 
        public Guid ID { get; set; }
        [BsonElement("timestamp_power_pairs")]
        public List<TimestampPowerPair> TimestampPowerPairs { get; set; }
    }
}

