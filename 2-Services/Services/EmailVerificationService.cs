using System.Security.Cryptography;
using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class EmailVerificationService
    {
        private readonly IEmailVerificationRepository _emailVerificationRepository;
        private readonly EmailService _emailService;
        private readonly CustomerService _customerService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<EmailVerificationService> _logger;

        private const int MaxAttempts = 5;
        private const int ExpirationMinutes = 5;

        public EmailVerificationService(
            IEmailVerificationRepository emailVerificationRepository,
            IUnitOfWork unitOfWork,
            EmailService emailService,
            CustomerService customerService,
            ILogger<EmailVerificationService> logger)
        {
            _emailVerificationRepository = emailVerificationRepository;
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _customerService = customerService;
            _logger = logger;
        }

        

        public async Task<EmailVerification?> GetEmailVerificationByIdAsync(string verificationId)
        {
            if (string.IsNullOrWhiteSpace(verificationId))
            {
                throw new BadRequestException("Verification ID cannot be empty.");
            }

            return await _emailVerificationRepository.GetVerificationByIdAsync(verificationId);
        }

        public async Task<EmailVerification> CreateEmailVerificationAsync(int customerId)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Invalid customer ID.");
            }

            var customer = await _customerService.GetCustomerByIdAsync(customerId);
            if (customer is null)
            {
                throw new NotFoundException($"Customer with ID {customerId} not found.");
            }

            await InvalidatePreviousVerificationsAsync(customerId);

            var verificationId = EmailVerificationHelper.GenerateVerificationId();
            var code = EmailVerificationHelper.GenerateVerificationCode();
            var codeHash = Convert.ToBase64String(EmailVerificationHelper.Hash(code));

            var emailVerification = new EmailVerification
            {
                CustomerId = customerId,
                VerificationId = verificationId,
                CodeHash = codeHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(ExpirationMinutes),
                Attempts = 0,
                CreatedAt = DateTime.UtcNow
            };

            await _emailVerificationRepository.AddAsync(emailVerification);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Email verification created for Customer ID {CustomerId}", customerId);

            try
            {
                await _emailService.SendVerificationCodeAsync(customer.Email, code);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to Customer ID {CustomerId}", customerId);
                throw new InternalServerErrorException("Failed to send verification email. Please try again later.");
            }

            return emailVerification;
        }

        public async Task<bool> VerifyCodeAsync(string verificationId, string code)
        {
            ValidateVerificationInput(verificationId, code);

            var emailVerification = await _emailVerificationRepository.GetVerificationByIdAsync(verificationId);
            if (emailVerification is null)
            {
                throw new BadRequestException("Invalid verification ID.");
            }

            if (!IsVerificationValid(emailVerification))
            {
                _logger.LogWarning("Verification code validation failed for ID {VerificationId} (Expired, Used, or Max Attempts)", verificationId);
                return false;
            }

            var inputHash = EmailVerificationHelper.Hash(code);
            var storedHash = Convert.FromBase64String(emailVerification.CodeHash);

            bool isMatched = CryptographicOperations.FixedTimeEquals(inputHash, storedHash);

            if (isMatched)
            {
                emailVerification.UsedAt = DateTime.UtcNow;
                _logger.LogInformation("Verification successful for VerificationId {VerificationId}", verificationId);
            }
            else
            {
                emailVerification.Attempts++;
                _logger.LogWarning("Failed OTP attempt {Attempts}/{MaxAttempts} for VerificationId {VerificationId}",
                    emailVerification.Attempts, MaxAttempts, verificationId);
            }

            _emailVerificationRepository.Update(emailVerification);
            await _unitOfWork.SaveChangesAsync();

            return isMatched;
        }


        private async Task InvalidatePreviousVerificationsAsync(int customerId)
        {

            var pendingVerifications = await _emailVerificationRepository.GetPendingVerificationsByCustomerIdAsync(customerId);

            if (pendingVerifications != null && pendingVerifications.Any())
            {
                foreach (var verification in pendingVerifications)
                {
                    verification.ExpiresAt = DateTime.UtcNow;
                    _emailVerificationRepository.Update(verification);
                }
            }
        }

        private static void ValidateVerificationInput(string verificationId, string code)
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

        private static bool IsVerificationValid(EmailVerification emailVerification)
        {
            if (emailVerification.UsedAt != null) 
                return false;

            if (emailVerification.ExpiresAt <= DateTime.UtcNow) 
                return false;

            if (emailVerification.Attempts >= MaxAttempts) 
                return false;

            return true;
        }
    }
}
