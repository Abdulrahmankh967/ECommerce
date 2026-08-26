using _1_Repository.Interfaces;

public interface IRefreshTokenRepository : IGenericRepository<RefreshToken>
{
    public Task<RefreshToken> GetBySelectorAsync(string selector);



}
