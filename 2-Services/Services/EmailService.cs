using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MimeKit;

public class EmailService
{
    private readonly SmtpSettings _smtpSettings;

    public EmailService(IOptions<SmtpSettings> smtpSettings)
    {
        _smtpSettings = smtpSettings.Value;
    }

    public async Task SendVerificationCodeAsync(string email,string code)
    {

        if (string.IsNullOrWhiteSpace(email))
            throw new BadRequestException("Recipient email is empty.");


        var message = new MimeMessage();

        message.From.Add(new MailboxAddress("E-Commerce",_smtpSettings.Username));

        message.To.Add(MailboxAddress.Parse(email));

        message.Subject = "Email Verification Code";

        message.Body = new TextPart("plain")
        {
            Text = $"Your verification code is: {code}"
        };
                using var smtp = new SmtpClient();

        await smtp.ConnectAsync(_smtpSettings.Host,_smtpSettings.Port,MailKit.Security.SecureSocketOptions.SslOnConnect);

        await smtp.AuthenticateAsync(_smtpSettings.Username, _smtpSettings.Password);

        await smtp.SendAsync(message);

        await smtp.DisconnectAsync(true);
    }
}   