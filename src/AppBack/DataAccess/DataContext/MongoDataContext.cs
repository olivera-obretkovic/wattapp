using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using prosumerAppBack.Models;

namespace prosumerAppBack.DataAccess
{
	public class MongoDataContext
	{
        private readonly IMongoDatabase _mongoDatabase;

        public MongoDataContext(IMongoDatabase mongoDatabase)
        {
            _mongoDatabase = mongoDatabase;
        }
        public IMongoCollection<PowerUsage> PowerUsage => _mongoDatabase.GetCollection<PowerUsage>("powerusage");
        public IMongoCollection<PowerUsage> PowerUsagePrediction => _mongoDatabase.GetCollection<PowerUsage>("powerusage_prediction");
    }
}

