using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly AppDbContext _context;
    public RefreshTokenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RefreshToken entity)
    {
        await _context.RefreshToken.AddAsync(entity);
    }

    public void Delete(RefreshToken entity)
    {
        throw new NotImplementedException();
    }

    public Task<List<RefreshToken>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public Task<RefreshToken?> GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    public void Update(RefreshToken entity)
    {
        throw new NotImplementedException();
    }

    public async Task<RefreshToken?> GetBySelectorAsync(string selector)
    {
        var RefToken = await _context.RefreshToken.FirstOrDefaultAsync(r => r.Selector == selector);

        return RefToken;
    }

    
}
