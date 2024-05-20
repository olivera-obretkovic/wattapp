using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Dispatcher
{
    public class DispatcherUpdateDto
    {
        [Required]
        public string? FirstName { get; set; }

        [Required]
        public string? LastName { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }
}
