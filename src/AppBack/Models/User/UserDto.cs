namespace prosumerAppBack.Models;

public class UserDto
{
    public Guid ID { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string PhoneNumber { get; set; }      
    public string Address { get; set; }
    public string City { get; set; }
    public string Country { get; set; }
    public string Role { get; set; }
    public string Email { get; set; }
    
    public UserDto ToDto()
    {
        return new UserDto
        {
            ID = this.ID,
            FirstName = this.FirstName,
            LastName = this.LastName,
            PhoneNumber = this.PhoneNumber,
            Address = this.Address,
            City = this.City,
            Country = this.Country,
            Role = this.Role,
            Email = this.Email
        };
    }
}