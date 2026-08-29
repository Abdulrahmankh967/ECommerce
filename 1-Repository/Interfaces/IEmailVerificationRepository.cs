using _1_Repository.Interfaces;

public interface IEmailVerificationRepository : IGenericRepository<EmailVerification>
{
    Task<EmailVerification?> GetVerificationByIdAsync(string id);

    Task<List<EmailVerification>> GetPendingVerificationsByCustomerIdAsync(int customerId);

}