using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Constellations.Models
{
    public class ConstellationDetails
    {
        [Key]
        public int ConstellationDetailsID { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string ConstellationName { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string ConstellationLatinName { get; set; }

        [Column(TypeName = "nvarchar(100)")]
        public string ConstellationStar { get; set; }
        public int ConstellationStarDistance { get; set; }
    }
}
