using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Dispatcher
{
    public class DispatcherLoginDto
    {
        [Required]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
