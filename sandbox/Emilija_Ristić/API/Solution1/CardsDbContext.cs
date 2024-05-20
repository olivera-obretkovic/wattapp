using System;
namespace Cards.API.Data { 
	public class CardDbContext : DbContext
	{
		public CardDbContext(CardDbOptions options) : base(options)
		{

		}

		public DbSet<Card> Cards { get; set; }

	}
}
