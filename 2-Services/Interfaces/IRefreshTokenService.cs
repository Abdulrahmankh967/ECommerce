using _1_Repository.Data;

namespace _2_Services.Interfaces
{
    public interface IRefreshTokenService
    {
        Task<RefreshToken?> ValidateRefreshTokenAsync(string rawRefreshToken);
        Task<RefreshToken?> GetBySelectorAsync(string selector);
        Task AddRefreshTokenAsync(string rawRefreshToken, int customerId);
        Task RevokeRefreshTokenAsync(string rawRefreshToken);
    }
}
