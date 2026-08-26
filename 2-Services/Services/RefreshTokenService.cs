using Konscious.Security.Cryptography;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

public class RefreshTokenService
{

    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public RefreshTokenService(IRefreshTokenRepository refreshTokenRepository, IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
    {
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public string[] ValidateRefreshTokenLenght(string refreshToken)
    {
        var splitToken = refreshToken.Split('.');

        if (splitToken.Length != 2)
        {
            throw new BadRequestException("Invalid refresh token format.");
        }
        return splitToken;

    }
    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string refreshToken)
    {
        var splitToken = ValidateRefreshTokenLenght(refreshToken);

        string selector = splitToken[0];
        string secret = splitToken[1];

        var storedToken = await _refreshTokenRepository.GetBySelectorAsync(selector);

        if (storedToken == null)
            return null;

        if (storedToken.RefreshTokenRevokedAt != null)
            return null;

        if (storedToken.RefreshTokenExpiresAt <= DateTime.UtcNow)
            return null;


        bool valid = _passwordHasher.Verify(secret, storedToken.RefreshTokenHash);

        if (!valid)
            return null;

        return storedToken;
    }

    public async Task<RefreshToken> GetBySelectorAsync(string Selector)
    {
        return await _refreshTokenRepository.GetBySelectorAsync(Selector);
    }

    public async Task AddRefreshTokenAsync(RefreshTokenRequest refreshToken, int customerId)
    {

        var splitToken = ValidateRefreshTokenLenght(refreshToken.RefreshToken);


        await _refreshTokenRepository.AddAsync(new RefreshToken
        {
            CustomerId = customerId,
            Selector = splitToken[0],
            RefreshTokenHash =_passwordHasher.Hash(splitToken[1]),
            RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30),
            RefreshTokenRevokedAt = null,
        });
        await _unitOfWork.SaveChangesAsync();
    }
    
    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var splitToken = ValidateRefreshTokenLenght(refreshToken);

        string selector = splitToken[0];


        var storedToken = await _refreshTokenRepository.GetBySelectorAsync(selector);
        ValidateRefreshToken(storedToken);

        storedToken.RefreshTokenRevokedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();
    }

    private static void ValidateRefreshToken(RefreshToken storedToken)
    {
        if (storedToken == null)
        {
            throw new ArgumentException("Refresh token not found.");
        }
        if (storedToken.RefreshTokenRevokedAt != null)
        {
            throw new InvalidOperationException("Refresh token has already been revoked.");
        }
        if (storedToken.RefreshTokenExpiresAt <= DateTime.UtcNow)
        {
            throw new InvalidOperationException("Refresh token has already expired.");
        }
    }

}
