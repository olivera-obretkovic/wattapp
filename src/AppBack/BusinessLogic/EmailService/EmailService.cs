using Microsoft.Extensions.Configuration;
using System;
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using Task = System.Threading.Tasks.Task;
using Microsoft.AspNetCore.Mvc.ModelBinding.Binders;
//using SendGrid;
//using SendGrid.Helpers.Mail;

namespace prosumerAppBack.Helper
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }
       
        public async Task SendEmailAsync(string email,string link)
        {
            var smtpClient = new SmtpClient();
            smtpClient.Host = "smtp.gmail.com";
            smtpClient.Port = 587;
            smtpClient.EnableSsl = true;
            smtpClient.UseDefaultCredentials = false;
            smtpClient.Credentials = new NetworkCredential("energysolvix@gmail.com", "pafwmwmqrtdfdqzb");

            // Create a new email message
            var message = new MailMessage();
            message.From = new MailAddress("energysolvix@gmail.com");
            message.To.Add(email);
            message.Subject = "Reset password for Energy Solvix";
            message.Body = link;

            try
            {
                // Send the email message
                smtpClient.Send(message);
                Console.WriteLine("Email sent successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending email: " + ex.Message);
            }
        }
    }
}

