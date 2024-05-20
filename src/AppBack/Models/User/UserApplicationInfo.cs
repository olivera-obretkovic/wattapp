namespace prosumerAppBack.Models
{
    public class UserApplicationInfo
    {
        public Guid ID { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Address { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Email { get; set; }
        public bool? Approved { get; set; }
        public DateTime? Date { get; set; }
    }
}
