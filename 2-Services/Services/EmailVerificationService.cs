using _2_Services.Services;
using MailKit.Net.Smtp;
using MimeKit;
using System.Security.Cryptography;
using System.Text;

public class EmailVerificationService
{
    private readonly IEmailVerificationRepository _emailVerificationRepository;

    private readonly EmailService _emailService;

    private readonly CustomerService _customerService;

    private readonly IUnitOfWork _unitOfWork;

    public EmailVerificationService(IEmailVerificationRepository emailVerificationRepository,IUnitOfWork unitOfWork, EmailService emailService,CustomerService customerService)
    {
        _emailVerificationRepository = emailVerificationRepository;

        _emailService = emailService;

        _customerService = customerService;

        _unitOfWork = unitOfWork;
    }


    public void ValidateEntity(EmailVerification entity)
    {
        if (entity == null)
           throw new ArgumentNullException(nameof(entity), "EmailVerification entity cannot be null.");

        if (string.IsNullOrWhiteSpace(entity.VerificationId))
            throw new ArgumentException("VerificationId cannot be null or empty.", nameof(entity.VerificationId));

        if (string.IsNullOrWhiteSpace(entity.CodeHash))
            throw new ArgumentException("CodeHash cannot be null or empty.", nameof(entity.CodeHash));

        if (entity.ExpiresAt <= DateTime.UtcNow)
            throw new ArgumentException("ExpiresAt must be a future date.", nameof(entity.ExpiresAt));

        if (entity.Attempts < 0)
            throw new ArgumentException("Attempts cannot be negative.", nameof(entity.Attempts));
    }


    public async Task<EmailVerification?> GetEmailVerificationByIdAsync(string verificationId)
    {
        return await _emailVerificationRepository.GetVerificationByIdAsync(verificationId);
    }

    public async Task<EmailVerification> CreateEmailVerificationAsync(int customerId)
    {
        var customer = await _customerService.GetCustomerByIdAsync(customerId);

        if (customer == null)
            throw new ArgumentException("Customer not found.");

        var verificationId = GenerateVerificationId();

        var code = GenerateVerificationCode();

        var codeHash = Convert.ToBase64String(HashCode(code));

        var emailVerification = new EmailVerification
        {
            CustomerId = customerId,
            VerificationId = verificationId,
            CodeHash = codeHash,
            ExpiresAt = DateTime.UtcNow.AddMinutes(5),
            Attempts = 0,
            CreatedAt = DateTime.UtcNow
        };

        ValidateEntity(emailVerification);

        await _emailVerificationRepository.AddAsync(emailVerification);

        await _unitOfWork.SaveChangesAsync();


        await _emailService.SendVerificationCodeAsync(customer.Email, code);

        return emailVerification;
        
    }

    public string GenerateVerificationId()
    {
        return Guid.NewGuid().ToString();
    }
    public string GenerateVerificationCode()
    {
        int code = RandomNumberGenerator.GetInt32(100000, 1000000);

        return code.ToString();
    }
    private byte[] HashCode(string code)
    {
        return SHA256.HashData(Encoding.UTF8.GetBytes(code));
    }

    public async Task<bool> VerifyCodeAsync(string verificationId, string code)
    {
        var emailVerification = await _emailVerificationRepository.GetVerificationByIdAsync(verificationId);
        (bool flowControl, bool value) = ValidateOTP(emailVerification);
        if (!flowControl)
        {
            return value;
        }

        var inputHash = HashCode(code);

        var storedHash = Convert.FromBase64String(emailVerification.CodeHash);

        if (CryptographicOperations.FixedTimeEquals(inputHash,storedHash))
        {
            emailVerification.UsedAt = DateTime.UtcNow;
            _emailVerificationRepository.Update(emailVerification);
            await _unitOfWork.SaveChangesAsync();
            return true; 
        }

        else
        {
            emailVerification.Attempts++;
            _emailVerificationRepository.Update(emailVerification);
            await _unitOfWork.SaveChangesAsync();
            return false;
        }
    }

    private (bool flowControl, bool value) ValidateOTP(EmailVerification? emailVerification)
    {
        if (emailVerification == null)
        {
            throw new ArgumentException("Invalid verification ID.");
        }
        if (emailVerification.UsedAt != null)
        {
            return (flowControl: false, value: false);
        }
        if(emailVerification.ExpiresAt < DateTime.UtcNow)
        {
            return (flowControl: false, value: false);
        }
        if (emailVerification.Attempts >= 5)
        {
            return (flowControl: false, value: false);
        }

        return (flowControl: true, value: default);
    }
}   

public class EmailService
{
    public async Task SendVerificationCodeAsync(string email,string code)
    {

        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException(
                "Recipient email is empty.",
                nameof(email));


        var message = new MimeMessage();

        message.From.Add(new MailboxAddress("Customer API","khlifatabood17@gmail.com"));

        message.To.Add(MailboxAddress.Parse(email));

        message.Subject = "Email Verification Code";

        message.Body = new TextPart("plain")
        {
            Text = $"Your verification code is: {code}"
        };
                using var smtp = new SmtpClient();

        await smtp.ConnectAsync("smtp.gmail.com",465,MailKit.Security.SecureSocketOptions.SslOnConnect);

        await smtp.AuthenticateAsync("khlifatabood17@gmail.com", "rrvs mzfr exjb dmwc");

        await smtp.SendAsync(message);

        await smtp.DisconnectAsync(true);
    }
}   