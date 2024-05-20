using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models.Dispatcher
{
    public class DispatcherPasswordUpdate
    {
        [Required]
        [MinLength(6)]
        public string OldPassword { get; set; }

        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; }
    }
}
