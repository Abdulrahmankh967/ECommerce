using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

public class EmailService
{
    private readonly SmtpSettings _smtpSettings;

    public EmailService(IOptions<SmtpSettings> smtpSettings)
    {
        _smtpSettings = smtpSettings.Value;
    }

    public Task SendVerificationCodeAsync(string email, string code)
        => SendEmailAsync(email, "Email Verification Code", $"Your verification code is: {code}");

    public Task SendPlaceOrderMessage(string email, string messageContent)
        => SendEmailAsync(email, "Order Placed Successfully", messageContent);

    private async Task SendEmailAsync(string email, string subject, string body)
    {
        if (string.IsNullOrWhiteSpace(email))
            throw new BadRequestException("Recipient email is empty.");

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("E-Commerce", _smtpSettings.Username));
        message.To.Add(MailboxAddress.Parse(email));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(_smtpSettings.Host, _smtpSettings.Port, SecureSocketOptions.SslOnConnect);
        await smtp.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);
        await smtp.SendAsync(message);
        await smtp.DisconnectAsync(true);
    }
}