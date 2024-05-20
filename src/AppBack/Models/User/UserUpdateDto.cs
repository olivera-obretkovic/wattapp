using System;
using System.ComponentModel.DataAnnotations;

namespace prosumerAppBack.Models
{
	public class UserUpdateDto
	{
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        [EmailAddress]
        public string Email { get; set; }
        public string Country { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public Boolean sharesDataWithDso { get; set; }
        public string? City { get; set; }
    }
}

