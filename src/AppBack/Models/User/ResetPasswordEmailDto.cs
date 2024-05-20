using System;
using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models
{
	public class ResetPasswordEmailDto
	{
		[Required]
		public string? Email { get; set; }
	}
}

