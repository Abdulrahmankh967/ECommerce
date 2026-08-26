using _2_Services.Services;
using System.Security.Cryptography;
using System.Text;

public class EmailVerificationService : EmailVerificationHelper
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
            throw new InvalidOperationException("EmailVerification entity cannot be null.");

        if (string.IsNullOrWhiteSpace(entity.VerificationId))
            throw new InvalidOperationException("EmailVerification has an invalid VerificationId.");

        if (string.IsNullOrWhiteSpace(entity.CodeHash))
            throw new InvalidOperationException("EmailVerification has an invalid CodeHash.");

        if (entity.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidOperationException("EmailVerification has an invalid expiration date.");

        if (entity.Attempts < 0)
            throw new InvalidOperationException("EmailVerification has an invalid Attempts value.");
    }

    public async Task<EmailVerification?> GetEmailVerificationByIdAsync(string verificationId)
    {
        return await _emailVerificationRepository.GetVerificationByIdAsync(verificationId);
    }

    public async Task<EmailVerification> CreateEmailVerificationAsync(int customerId)
    {
        var customer = await _customerService.GetCustomerByIdAsync(customerId);

        var verificationId =EmailVerificationHelper.GenerateVerificationId();

        var code =EmailVerificationHelper.GenerateVerificationCode();

        var codeHash = Convert.ToBase64String(EmailVerificationHelper.Hash(code));

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

    public async Task<bool> VerifyCodeAsync(string verificationId, string code)
    {
        ValidateVerificationIdAndCode(verificationId, code);

        var emailVerification = await _emailVerificationRepository.GetVerificationByIdAsync(verificationId);

        if (emailVerification == null)
        {
            throw new BadRequestException("Invalid verification ID.");
        }

        
        if (!ValidateOTP(emailVerification))
        {
            return false;
        }

        var inputHash = EmailVerificationHelper.Hash(code);


        var storedHash = Convert.FromBase64String(emailVerification.CodeHash);

        if (CryptographicOperations.FixedTimeEquals(inputHash, storedHash))
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

    private static void ValidateVerificationIdAndCode(string verificationId, string code)
    {
        if (string.IsNullOrWhiteSpace(verificationId))
        {
            throw new BadRequestException("Verification ID is required.");
        }

        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BadRequestException("Verification code is required.");
        }

        if (code.Length != 6 || !code.All(char.IsDigit))
        {
            throw new BadRequestException("Verification code must be a 6-digit number.");
        }
    }

    private bool ValidateOTP(EmailVerification emailVerification)
    {
        if (emailVerification.UsedAt != null)
            return false;

        if (emailVerification.ExpiresAt <= DateTime.UtcNow)
            return false;

        if (emailVerification.Attempts >= 5)
            return false;

        return true;
    }
}
