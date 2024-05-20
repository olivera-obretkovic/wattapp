using System.ComponentModel.DataAnnotations;
using prosumerAppBack.DataAccess;
using prosumerAppBack.Helper;
namespace prosumerAppBack.Models
{
    public class User
    {
        public User(User user)
        {
            ID = user.ID;
            FirstName = user.FirstName;
            LastName = user.LastName;
            PasswordHash = user.PasswordHash;
            Salt = user.Salt;
            PhoneNumber = user.PhoneNumber;
            Address = user.Address;
            City = user.City;
            Country = user.Country;
            Role = user.Role;
            Email = user.Email;
            Devices = user.Devices;
            profilePicture = null;
        }

        public User()
        {
            
        }

        [Key]
        public Guid ID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] Salt { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Role { get; set; }
        public string? Email { get; set; }

        public string? profilePicture { get; set; }
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpires { get; set; }
        public Boolean sharesDataWithDso { get; set; }
        public ICollection<Device.Device> Devices { get; set; }
        
    }
}
