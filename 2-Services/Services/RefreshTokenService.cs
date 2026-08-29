using Microsoft.Extensions.Logging;

namespace _2_Services.Services
{
    public class RefreshTokenService
    {
        private readonly IRefreshTokenRepository _refreshTokenRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordHasher _passwordHasher;
        private readonly ILogger<RefreshTokenService> _logger;

        private const int RefreshTokenExpirationDays = 30;

        public RefreshTokenService(
            IRefreshTokenRepository refreshTokenRepository,
            IUnitOfWork unitOfWork,
            IPasswordHasher passwordHasher,
            ILogger<RefreshTokenService> logger)
        {
            _refreshTokenRepository = refreshTokenRepository;
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
            _logger = logger;
        }

        
        public async Task<RefreshToken?> ValidateRefreshTokenAsync(string rawRefreshToken)
        {
            var (selector, secret) = SplitAndValidateTokenFormat(rawRefreshToken);

            var storedToken = await _refreshTokenRepository.GetBySelectorAsync(selector);
            if (storedToken is null)
            {
                _logger.LogWarning("Refresh token validation failed: Selector {Selector} not found", selector);
                return null;
            }

            if (!IsTokenActive(storedToken))
            {
                _logger.LogWarning("Refresh token validation failed: Token {Selector} is expired or revoked", selector);
                return null;
            }

            bool isValidSecret = _passwordHasher.Verify(secret, storedToken.RefreshTokenHash);
            if (!isValidSecret)
            {
                _logger.LogWarning("Refresh token validation failed: Invalid secret for Selector {Selector}", selector);
                return null;
            }

            return storedToken;
        }

        public async Task<RefreshToken?> GetBySelectorAsync(string selector)
        {
            if (string.IsNullOrWhiteSpace(selector))
            {
                throw new BadRequestException("Selector cannot be empty.");
            }

            return await _refreshTokenRepository.GetBySelectorAsync(selector);
        }

        public async Task AddRefreshTokenAsync(string rawRefreshToken, int customerId)
        {
            if (customerId <= 0)
            {
                throw new BadRequestException("Invalid customer ID.");
            }

            var (selector, secret) = SplitAndValidateTokenFormat(rawRefreshToken);

            var token = new RefreshToken
            {
                CustomerId = customerId,
                Selector = selector,
                RefreshTokenHash = _passwordHasher.Hash(secret),
                RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(RefreshTokenExpirationDays),
                RefreshTokenRevokedAt = null
            };

            await _refreshTokenRepository.AddAsync(token);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Refresh token added successfully for Customer ID {CustomerId}", customerId);
        }

        public async Task RevokeRefreshTokenAsync(string rawRefreshToken)
        {
            var (selector, secret) = SplitAndValidateTokenFormat(rawRefreshToken);

            var storedToken = await _refreshTokenRepository.GetBySelectorAsync(selector);

            if (storedToken is null)
            {
                throw new NotFoundException("Refresh token not found.");
            }

            if (storedToken.RefreshTokenRevokedAt != null)
            {
                throw new BadRequestException("Refresh token has already been revoked.");
            }

            bool isValidSecret = _passwordHasher.Verify(secret, storedToken.RefreshTokenHash);

            if (!isValidSecret)
            {
                throw new BadRequestException("Invalid refresh token.");
            }

            storedToken.RefreshTokenRevokedAt = DateTime.UtcNow;

            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Refresh token revoked for Selector {Selector}", selector);
        }


        public static (string Selector, string Secret) SplitAndValidateTokenFormat(string rawRefreshToken)
        {
            if (string.IsNullOrWhiteSpace(rawRefreshToken))
            {
                throw new BadRequestException("Refresh token is required.");
            }

            var parts = rawRefreshToken.Split('.');
            if (parts.Length != 2 || string.IsNullOrWhiteSpace(parts[0]) || string.IsNullOrWhiteSpace(parts[1]))
            {
                throw new BadRequestException("Invalid refresh token format.");
            }

            return (parts[0], parts[1]);
        }

        private static bool IsTokenActive(RefreshToken token)
        {
            return token.RefreshTokenRevokedAt == null && token.RefreshTokenExpiresAt > DateTime.UtcNow;
        }

    }
}