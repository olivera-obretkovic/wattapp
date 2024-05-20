using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace Constellations.Models
{
    public class ConstellationDetailsContext : DbContext
    {
        public ConstellationDetailsContext(DbContextOptions<ConstellationDetailsContext> options) : base(options)
        {
        }

        public DbSet<ConstellationDetails> ConstellationDetail { get; set; }


    }
}
