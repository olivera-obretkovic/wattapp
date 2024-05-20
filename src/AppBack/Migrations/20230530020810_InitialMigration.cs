using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace prosumerAppBack.Migrations
{
    /// <inheritdoc />
    public partial class InitialMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BatteryStatuses",
                columns: table => new
                {
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    BatteryPercent = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BatteryStatuses", x => x.Date);
                });

            migrationBuilder.CreateTable(
                name: "DeviceGroups",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceGroups", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DeviceManufacturers",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceManufacturers", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DeviceRequirements",
                columns: table => new
                {
                    DeviceID = table.Column<Guid>(type: "TEXT", nullable: false),
                    ChargedUpTo = table.Column<int>(type: "INTEGER", nullable: false),
                    ChargedUpToStatus = table.Column<bool>(type: "INTEGER", nullable: false),
                    ChargedUntil = table.Column<string>(type: "TEXT", nullable: false),
                    ChargedUntilBattery = table.Column<int>(type: "INTEGER", nullable: false),
                    ChargedUntilBatteryStatus = table.Column<bool>(type: "INTEGER", nullable: false),
                    ChargeEveryDay = table.Column<string>(type: "TEXT", nullable: false),
                    ChargeEveryDayStatus = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceRequirements", x => x.DeviceID);
                });

            migrationBuilder.CreateTable(
                name: "DeviceRules",
                columns: table => new
                {
                    DeviceID = table.Column<Guid>(type: "TEXT", nullable: false),
                    TurnOn = table.Column<string>(type: "TEXT", nullable: false),
                    TurnOnStatus = table.Column<bool>(type: "INTEGER", nullable: false),
                    TurnOff = table.Column<string>(type: "TEXT", nullable: false),
                    TurnOffStatus = table.Column<bool>(type: "INTEGER", nullable: false),
                    TurnOnEvery = table.Column<string>(type: "TEXT", nullable: false),
                    TurnOnEveryStatus = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceRules", x => x.DeviceID);
                });

            migrationBuilder.CreateTable(
                name: "Dispatchers",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: true),
                    LastName = table.Column<string>(type: "TEXT", nullable: true),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordHash = table.Column<byte[]>(type: "BLOB", nullable: false),
                    Salt = table.Column<byte[]>(type: "BLOB", nullable: false),
                    Role = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dispatchers", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    FirstName = table.Column<string>(type: "TEXT", nullable: true),
                    LastName = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordHash = table.Column<byte[]>(type: "BLOB", nullable: false),
                    Salt = table.Column<byte[]>(type: "BLOB", nullable: false),
                    PhoneNumber = table.Column<string>(type: "TEXT", nullable: true),
                    Address = table.Column<string>(type: "TEXT", nullable: true),
                    City = table.Column<string>(type: "TEXT", nullable: true),
                    Country = table.Column<string>(type: "TEXT", nullable: true),
                    Role = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    profilePicture = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "TEXT", nullable: true),
                    PasswordResetTokenExpires = table.Column<DateTime>(type: "TEXT", nullable: true),
                    sharesDataWithDso = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "UsersAppliedToDSO",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    UserID = table.Column<Guid>(type: "TEXT", nullable: false),
                    Approved = table.Column<bool>(type: "INTEGER", nullable: true),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UsersAppliedToDSO", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "DeviceTypes",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    Name = table.Column<string>(type: "TEXT", nullable: false),
                    GroupID = table.Column<Guid>(type: "TEXT", nullable: false),
                    ManufacturerID = table.Column<Guid>(type: "TEXT", nullable: false),
                    Wattage = table.Column<double>(type: "REAL", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceTypes", x => x.ID);
                    table.ForeignKey(
                        name: "FK_DeviceTypes_DeviceGroups_GroupID",
                        column: x => x.GroupID,
                        principalTable: "DeviceGroups",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_DeviceTypes_DeviceManufacturers_ManufacturerID",
                        column: x => x.ManufacturerID,
                        principalTable: "DeviceManufacturers",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    ID = table.Column<Guid>(type: "TEXT", nullable: false),
                    MacAdress = table.Column<string>(type: "TEXT", nullable: true),
                    DeviceName = table.Column<string>(type: "TEXT", nullable: true),
                    DeviceTypeID = table.Column<Guid>(type: "TEXT", nullable: false),
                    OwnerID = table.Column<Guid>(type: "TEXT", nullable: false),
                    IsOn = table.Column<bool>(type: "INTEGER", nullable: false),
                    dsoHasControl = table.Column<bool>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.ID);
                    table.ForeignKey(
                        name: "FK_Devices_DeviceTypes_DeviceTypeID",
                        column: x => x.DeviceTypeID,
                        principalTable: "DeviceTypes",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Devices_Users_OwnerID",
                        column: x => x.OwnerID,
                        principalTable: "Users",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BatteryConnections",
                columns: table => new
                {
                    ConnectionID = table.Column<Guid>(type: "TEXT", nullable: false),
                    BatteryID = table.Column<Guid>(type: "TEXT", nullable: false),
                    DeviceID = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BatteryConnections", x => x.ConnectionID);
                    table.ForeignKey(
                        name: "FK_BatteryConnections_Devices_DeviceID",
                        column: x => x.DeviceID,
                        principalTable: "Devices",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "DeviceGroups",
                columns: new[] { "ID", "Name" },
                values: new object[,]
                {
                    { new Guid("18f30035-59de-474f-b9db-987476de551f"), "Producer" },
                    { new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), "Consumer" },
                    { new Guid("b17c9155-7e6f-4d37-8a86-ea1abb327bb2"), "Storage" }
                });

            migrationBuilder.InsertData(
                table: "DeviceManufacturers",
                columns: new[] { "ID", "Name" },
                values: new object[,]
                {
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d"), "Bosch" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4e"), "Siemens" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4f"), "Miele" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d50"), "AEG" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d51"), "Electrolux" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d52"), "Zanussi" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d53"), "Beko" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d54"), "Indesit" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d55"), "Candy" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d56"), "Whirlpool" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d57"), "Gorenje" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d58"), "Smeg" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d59"), "Hoover" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d60"), "Grundig" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d61"), "Neff" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d62"), "Bauknecht" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d63"), "Hotpoint" },
                    { new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d64"), "Ariston" }
                });

            migrationBuilder.InsertData(
                table: "Dispatchers",
                columns: new[] { "ID", "Email", "FirstName", "LastName", "PasswordHash", "PhoneNumber", "Role", "Salt" },
                values: new object[] { new Guid("6bce51ea-9824-4393-b9a5-732b5a9b7f53"), "admin@gmail.com", "Adminovic", "Adminovski", new byte[] { 10, 145, 26, 134, 206, 101, 75, 110, 56, 55, 189, 44, 244, 31, 165, 31, 141, 100, 50, 34, 76, 77, 172, 125, 90, 29, 194, 107, 111, 211, 162, 53 }, null, "Admin", new byte[] { 32, 249, 199, 248, 126, 13, 68, 147, 245, 138, 149, 43, 227, 126, 26, 189 } });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "ID", "Address", "City", "Country", "Email", "FirstName", "LastName", "PasswordHash", "PasswordResetToken", "PasswordResetTokenExpires", "PhoneNumber", "Role", "Salt", "profilePicture", "sharesDataWithDso" },
                values: new object[] { new Guid("6bce51ea-9824-4393-b9a5-732b5a9b7f52"), "Radoja Domanovica 6", "Kragujevac", "Serbia", "petarsimic@gmail.com", "Petar", "Simic", new byte[] { 245, 201, 224, 175, 173, 23, 137, 153, 55, 169, 153, 215, 70, 80, 198, 28, 91, 157, 247, 237, 208, 176, 63, 161, 79, 211, 169, 117, 139, 45, 248, 75 }, null, null, "064-316-15-81", "UnapprovedUser", new byte[] { 214, 146, 57, 149, 91, 215, 7, 34, 151, 173, 167, 167, 255, 222, 145, 113 }, null, false });

            migrationBuilder.InsertData(
                table: "DeviceTypes",
                columns: new[] { "ID", "GroupID", "ManufacturerID", "Name", "Wattage" },
                values: new object[,]
                {
                    { new Guid("06baaad5-80b8-446b-9480-948e8ba9d52b"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d63"), "Microwave", 1100.0 },
                    { new Guid("0bda9b57-df0e-485e-b209-409b26f046e0"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d61"), "Cooker Hood", 110.0 },
                    { new Guid("1435a6e0-fe87-4b65-90f2-cab08abc51fc"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d52"), "Freezer", 200.0 },
                    { new Guid("1ac7203e-b15c-47ce-bc23-08b5b62d225e"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4e"), "Dryer", 3400.0 },
                    { new Guid("311175ce-f67c-4f5b-b96c-a11243534f3f"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d"), "Washing Machine", 1000.0 },
                    { new Guid("32ea7105-f582-4441-ae81-b738c4284f7e"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d54"), "Dishwasher", 1800.0 },
                    { new Guid("696e9069-6bac-47e4-a7c2-8c4779ed33ba"), new Guid("18f30035-59de-474f-b9db-987476de551f"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4f"), "Wind Turbine", 1000.0 },
                    { new Guid("696e9069-6bac-47e4-a7c2-8c4779ed33bb"), new Guid("18f30035-59de-474f-b9db-987476de551f"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d50"), "Wind Turbine", 2000.0 },
                    { new Guid("73e8b43e-bfaf-4db9-9f36-cf40cc057a6c"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d58"), "Refrigerator", 250.0 },
                    { new Guid("783d8bd7-725b-42b6-a76b-6e9ad0fca6da"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d51"), "Refrigerator", 250.0 },
                    { new Guid("815f9d3e-f0f8-4e0d-9b6e-9043293bee9d"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d52"), "Dishwasher", 1800.0 },
                    { new Guid("9d3d39b2-56d8-44e7-8ad5-b64efc6784f1"), new Guid("b17c9155-7e6f-4d37-8a86-ea1abb327bb2"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d50"), "Battery", 10000.0 },
                    { new Guid("9d3d39b2-56d8-44e7-8ad5-b64efc6784f2"), new Guid("b17c9155-7e6f-4d37-8a86-ea1abb327bb2"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4e"), "Battery", 15000.0 },
                    { new Guid("9d3d39b2-56d8-44e7-8ad5-b64efc6784f3"), new Guid("b17c9155-7e6f-4d37-8a86-ea1abb327bb2"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d52"), "Battery", 12000.0 },
                    { new Guid("9d3d39b2-56d8-44e7-8ad5-b64efc6784fe"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d61"), "Washing Machine", 1000.0 },
                    { new Guid("a2d2d5ec-b064-4f72-9e0e-84c1171cc14d"), new Guid("18f30035-59de-474f-b9db-987476de551f"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d63"), "Solar Panel", 4000.0 },
                    { new Guid("a2d2d5ec-b064-4f72-9e0e-84c1171cc14f"), new Guid("18f30035-59de-474f-b9db-987476de551f"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d54"), "Solar Panel", 6000.0 },
                    { new Guid("d3105304-6ec5-4aed-9b53-9c7ef8e81c4c"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d60"), "Oven", 3500.0 },
                    { new Guid("da04e45d-559b-4b24-b20b-2d7335db2cf0"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d56"), "Range", 4500.0 },
                    { new Guid("f2f9be26-5c5f-43e1-aa2f-8e64960d03dd"), new Guid("77cbc929-1cf2-4750-900a-164de4abe28b"), new Guid("4d4d4d4d-4d4d-4d4d-4d4d-4d4d4d4d4d4d"), "Dryer", 3400.0 }
                });

            migrationBuilder.InsertData(
                table: "Devices",
                columns: new[] { "ID", "DeviceName", "DeviceTypeID", "IsOn", "MacAdress", "OwnerID", "dsoHasControl" },
                values: new object[,]
                {
                    { new Guid("32ea7105-f582-4441-ae81-b738c4284f7d"), "Solarni Panel", new Guid("a2d2d5ec-b064-4f72-9e0e-84c1171cc14d"), false, "00-1B-63-84-45-E7", new Guid("6bce51ea-9824-4393-b9a5-732b5a9b7f52"), false },
                    { new Guid("32ea7105-f582-4441-ae81-b738c4284f7e"), "Ves Masina", new Guid("32ea7105-f582-4441-ae81-b738c4284f7e"), false, "00-1B-63-84-45-E6", new Guid("6bce51ea-9824-4393-b9a5-732b5a9b7f52"), false }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BatteryConnections_DeviceID",
                table: "BatteryConnections",
                column: "DeviceID");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_DeviceTypeID",
                table: "Devices",
                column: "DeviceTypeID");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_OwnerID",
                table: "Devices",
                column: "OwnerID");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTypes_GroupID",
                table: "DeviceTypes",
                column: "GroupID");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceTypes_ManufacturerID",
                table: "DeviceTypes",
                column: "ManufacturerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BatteryConnections");

            migrationBuilder.DropTable(
                name: "BatteryStatuses");

            migrationBuilder.DropTable(
                name: "DeviceRequirements");

            migrationBuilder.DropTable(
                name: "DeviceRules");

            migrationBuilder.DropTable(
                name: "Dispatchers");

            migrationBuilder.DropTable(
                name: "UsersAppliedToDSO");

            migrationBuilder.DropTable(
                name: "Devices");

            migrationBuilder.DropTable(
                name: "DeviceTypes");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "DeviceGroups");

            migrationBuilder.DropTable(
                name: "DeviceManufacturers");
        }
    }
}
