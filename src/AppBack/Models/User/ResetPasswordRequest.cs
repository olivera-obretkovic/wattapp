using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models
{
    public class ResetPasswordRequest
    {
        [Required]
        public string PasswordResetToken { get; set; }
        [Required]
        public string Password { get; set; }
        [Required, Compare("Password")]
        public string ConfirmPassword { get; set; }
    }
}
