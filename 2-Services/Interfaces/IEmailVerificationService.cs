using _1_Repository.Data;

namespace _2_Services.Interfaces
{
    public interface IEmailVerificationService
    {
        Task<EmailVerification?> GetEmailVerificationByIdAsync(string verificationId);
        Task<EmailVerification> CreateEmailVerificationAsync(int customerId);
        Task<bool> VerifyCodeAsync(string verificationId, string code);
    }
}
