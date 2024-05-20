using System;
using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models
{
	public class ResetPasswordDto
	{
        [Required]
        public string? Password { get; set; }
	}
}

