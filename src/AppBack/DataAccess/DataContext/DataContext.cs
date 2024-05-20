using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using prosumerAppBack.Models;
using prosumerAppBack.Models.Device;
using prosumerAppBack.Models.Dispatcher;
using prosumerAppBack.Helper;

namespace prosumerAppBack.DataAccess
{
    public class DataContext : DbContext
    {
        private readonly PasswordHasher _helper;
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {
            
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UsersRequestedToDso> UsersAppliedToDSO { get; set; }
        public DbSet<Device> Devices { get; set; }
        public DbSet<DeviceType> DeviceTypes { get; set; }
        public DbSet<DeviceGroup> DeviceGroups { get; set; }
        public DbSet<DeviceManufacturers> DeviceManufacturers { get; set; }
        public DbSet<DeviceRule> DeviceRules { get; set; }
        public DbSet<DeviceRequirement> DeviceRequirements { get; set; }
        public DbSet<BatteryConnections> BatteryConnections { get; set; }
        public DbSet<BatteryStatus> BatteryStatuses { get; set; }
        public DbSet<Dispatcher> Dispatchers { get; set; }
        private const int SaltSize = 16;
        private const int HashSize = 32;
        private const int Iterations = 10000;
    
        public (byte[] salt, byte[] hash) HashPassword(string password)
        {
            byte[] salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
        
            byte[] hash = new byte[HashSize];
            using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
            {
                hash = pbkdf2.GetBytes(HashSize);
            }
        
            return (salt, hash);
        }
        
        public User AddDefaultUser()
        {
            var user = new User
            {
                ID = new Guid("6BCE51EA-9824-4393-B9A5-732B5A9B7F52"),
                FirstName = "Petar",
                LastName = "Simic",
                PhoneNumber = "064-316-15-81",
                Address = "Radoja Domanovica 6",
                City = "Kragujevac",
                Country = "Serbia",
                Role = "UnapprovedUser",
                Email = "petarsimic@gmail.com",
                PasswordResetToken = null,
                PasswordResetTokenExpires = null
            };
            
            var password = "petar123";
            (byte[] salt, byte[] hash) hash = HashPassword(password);
            
            user.PasswordHash = hash.hash;
            user.Salt = hash.salt;
            
            return user;
        }

        public Dispatcher AddDefaultDisp()
        {
            var user = new Dispatcher
            {
                ID = new Guid("6BCE51EA-9824-4393-B9A5-732B5A9B7F53"),
                Role = "Admin",
                Email = "admin@gmail.com",
                FirstName = "Adminovic",
                LastName = "Adminovski"
            };
            
            var password = "admin123";
            (byte[] salt, byte[] hash) hash = HashPassword(password);
            
            user.PasswordHash = hash.hash;
            user.Salt = hash.salt;
            
            return user;
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<DeviceType>()
                .HasOne(d => d.Group)
                .WithMany(g => g.DeviceTypes)
                .HasForeignKey(d => d.GroupID);

            modelBuilder.Entity<DeviceType>()
                .HasOne(d => d.Manufacturer)
                .WithMany(m => m.DeviceTypes)
                .HasForeignKey(d => d.ManufacturerID);
            
            modelBuilder.Entity<Device>()
                .HasOne(d => d.DeviceType)
                .WithMany(dt => dt.Devices)
                .HasForeignKey(d => d.DeviceTypeID);

            modelBuilder.Entity<Device>()
                .HasOne(d => d.Owner)
                .WithMany(u => u.Devices)
                .HasForeignKey(d => d.OwnerID);
            modelBuilder.Entity<DeviceGroup>().HasData(
                new DeviceGroup{ID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"),Name = "Consumer"},
                new DeviceGroup{ID = new Guid("18F30035-59DE-474F-B9DB-987476DE551F"),Name = "Producer"},
                new DeviceGroup{ID = new Guid("B17C9155-7E6F-4D37-8A86-EA1ABB327BB2"),Name = "Storage"}
            );
            modelBuilder.Entity<DeviceManufacturers>().HasData(
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4D"), Name = "Bosch"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4E"), Name = "Siemens"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4F"), Name = "Miele"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D50"), Name = "AEG"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D51"), Name = "Electrolux"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D52"), Name = "Zanussi"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D53"), Name = "Beko"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D54"), Name = "Indesit"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D55"), Name = "Candy"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D56"), Name = "Whirlpool"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D57"), Name = "Gorenje"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D58"), Name = "Smeg"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D59"), Name = "Hoover"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D60"), Name = "Grundig"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D61"),Name = "Neff"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D62"),Name = "Bauknecht"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D63"),Name = "Hotpoint"},
                new DeviceManufacturers{ID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D64"),Name = "Ariston"}
            );

            modelBuilder.Entity<DeviceType>().HasData(
                new DeviceType{ID=new Guid("9D3D39B2-56D8-44E7-8AD5-B64EFC6784FE"), Name = "Washing Machine", GroupID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D61"), Wattage = 1000},

            new DeviceType{ID=new Guid("D3105304-6EC5-4AED-9B53-9C7EF8E81C4C"), Name = "Oven", GroupID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D60"), Wattage = 3500},

            new DeviceType{ID=new Guid("73E8B43E-BFAF-4DB9-9F36-CF40CC057A6C"), Name = "Refrigerator", GroupID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D58"), Wattage = 250},

            new DeviceType{ID=new Guid("815F9D3E-F0F8-4E0D-9B6E-9043293BEE9D"), Name = "Dishwasher", GroupID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D52"), Wattage = 1800},

            new DeviceType{ID=new Guid("1AC7203E-B15C-47CE-BC23-08B5B62D225E"), Name = "Dryer", GroupID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4E"), Wattage = 3400},

            new DeviceType{ID=new Guid("0BDA9B57-DF0E-485E-B209-409B26F046E0"), Name = "Cooker Hood", GroupID = new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID = new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D61"), Wattage = 110},
                new DeviceType{ID=new Guid("06BAAAD5-80B8-446B-9480-948E8BA9D52B"), Name="Microwave", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D63"), Wattage=1100},

            new DeviceType{ID=new Guid("1435A6E0-FE87-4B65-90F2-CAB08ABC51FC"), Name="Freezer", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D52"), Wattage=200},

            new DeviceType{ID=new Guid("DA04E45D-559B-4B24-B20B-2D7335DB2CF0"), Name="Range", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D56"), Wattage=4500},

            new DeviceType{ID=new Guid("311175CE-F67C-4F5B-B96C-A11243534F3F"), Name="Washing Machine", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4D"), Wattage=1000},

            new DeviceType{ID=new Guid("783D8BD7-725B-42B6-A76B-6E9AD0FCA6DA"), Name="Refrigerator", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D51"), Wattage=250},

            new DeviceType{ID=new Guid("32EA7105-F582-4441-AE81-B738C4284F7E"), Name="Dishwasher", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D54"), Wattage=1800},

            new DeviceType{ID=new Guid("F2F9BE26-5C5F-43E1-AA2F-8E64960D03DD"), Name="Dryer", GroupID=new Guid("77CBC929-1CF2-4750-900A-164DE4ABE28B"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4D"), Wattage=3400},

            new DeviceType{ID=new Guid("696E9069-6BAC-47E4-A7C2-8C4779ED33BB"), Name="Wind Turbine", GroupID=new Guid("18F30035-59DE-474F-B9DB-987476DE551F"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D50"), Wattage=2000},
            new DeviceType{ID=new Guid("696E9069-6BAC-47E4-A7C2-8C4779ED33BA"), Name="Wind Turbine", GroupID=new Guid("18F30035-59DE-474F-B9DB-987476DE551F"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4F"), Wattage=1000},
            new DeviceType{ID=new Guid("A2D2D5EC-B064-4F72-9E0E-84C1171CC14F"), Name="Solar Panel", GroupID=new Guid("18F30035-59DE-474F-B9DB-987476DE551F"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D54"), Wattage=6000},
            new DeviceType{ID=new Guid("A2D2D5EC-B064-4F72-9E0E-84C1171CC14D"), Name="Solar Panel", GroupID=new Guid("18F30035-59DE-474F-B9DB-987476DE551F"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D63"), Wattage=4000}, 
                new DeviceType{ID=new Guid("9D3D39B2-56D8-44E7-8AD5-B64EFC6784F2"), Name="Battery", GroupID=new Guid("B17C9155-7E6F-4D37-8A86-EA1ABB327BB2"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D4E"), Wattage=15000},
            new DeviceType{ID=new Guid("9D3D39B2-56D8-44E7-8AD5-B64EFC6784F3"), Name="Battery", GroupID=new Guid("B17C9155-7E6F-4D37-8A86-EA1ABB327BB2"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D52"), Wattage=12000},
            new DeviceType{ID=new Guid("9D3D39B2-56D8-44E7-8AD5-B64EFC6784F1"), Name="Battery", GroupID=new Guid("B17C9155-7E6F-4D37-8A86-EA1ABB327BB2"), ManufacturerID=new Guid("4D4D4D4D-4D4D-4D4D-4D4D-4D4D4D4D4D50"), Wattage=10000}
            );
            modelBuilder.Entity<User>().HasData(
                AddDefaultUser()
            );
            modelBuilder.Entity<Dispatcher>().HasData(
                AddDefaultDisp()
            );
            modelBuilder.Entity<Device>().HasData(
                new Device{ID=new Guid("32EA7105-F582-4441-AE81-B738C4284F7E"), MacAdress="00-1B-63-84-45-E6", DeviceTypeID=new Guid("32EA7105-F582-4441-AE81-B738C4284F7E"), OwnerID = new Guid("6BCE51EA-9824-4393-B9A5-732B5A9B7F52"), DeviceName = "Ves Masina"},
                new Device{ID=new Guid("32EA7105-F582-4441-AE81-B738C4284F7D"), MacAdress="00-1B-63-84-45-E7", DeviceTypeID=new Guid("A2D2D5EC-B064-4F72-9E0E-84C1171CC14D"), OwnerID = new Guid("6BCE51EA-9824-4393-B9A5-732B5A9B7F52"), DeviceName = "Solarni Panel"}
            );
        }
    }
}
