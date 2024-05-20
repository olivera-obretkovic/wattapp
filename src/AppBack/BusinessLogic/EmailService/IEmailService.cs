using System;
namespace prosumerAppBack.Helper
{
	public interface IEmailService
	{
		Task SendEmailAsync(string email, string link);
	}
}

