using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Constellations.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConstellationDetail",
                columns: table => new
                {
                    ConstellationDetailsID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ConstellationName = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    ConstellationLatinName = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    ConstellationStar = table.Column<string>(type: "nvarchar(100)", nullable: false),
                    ConstellationStarDistance = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConstellationDetail", x => x.ConstellationDetailsID);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConstellationDetail");
        }
    }
}
