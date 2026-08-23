using _1_Repository.Context;
using _1_Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class EmailVerificationRepository : IEmailVerificationRepository
{
    private readonly AppDbContext _context;

    public EmailVerificationRepository(AppDbContext context)
    {
        _context = context;
    }



    public async Task AddAsync(EmailVerification verification)
    {
        await _context.EmailVerification.AddAsync(verification);
    }

    public async Task<EmailVerification?> GetVerificationByIdAsync(string verificationId)
    {
        return await _context.EmailVerification
            .FirstOrDefaultAsync(x => x.VerificationId == verificationId);
    }

    public Task UpdateAsync(EmailVerification verification)
    {
        _context.EmailVerification.Update(verification);

        return Task.CompletedTask;
    }

    void IGenericRepository<EmailVerification>.Delete(EmailVerification entity)
    {
        throw new NotImplementedException();
    }

    Task<List<EmailVerification>> IGenericRepository<EmailVerification>.GetAllAsync()
    {
        throw new NotImplementedException();
    }

    Task<EmailVerification?> IGenericRepository<EmailVerification>.GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    public void Update(EmailVerification entity)
    {
        _context.Update(entity);
    }
}