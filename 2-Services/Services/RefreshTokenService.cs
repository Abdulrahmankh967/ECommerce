using Konscious.Security.Cryptography;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

public class RefreshTokenService
{
        
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RefreshTokenService(IRefreshTokenRepository refreshTokenRepository,IUnitOfWork unitOfWork)
    { 
        _refreshTokenRepository = refreshTokenRepository;
        _unitOfWork = unitOfWork;
    }

    public string[] ValidateRefreshToken(string refreshToken)
    {
        var splitToken = refreshToken.Split('.');

        if (splitToken.Length != 2)
        {
            throw new ArgumentException("Invalid refresh token format.");
        }
        return splitToken;

    }
    public async Task<RefreshToken?> ValidateRefreshTokenAsync(string refreshToken)
    {
        var splitToken = ValidateRefreshToken(refreshToken);

        string selector = splitToken[0];
        string secret = splitToken[1];

        var storedToken =
            await _refreshTokenRepository.GetBySelectorAsync(selector);

        if (storedToken == null)
            return null;

        if (storedToken.RefreshTokenRevokedAt != null)
            return null;

        if (storedToken.RefreshTokenExpiresAt <= DateTime.UtcNow)
            return null;


        bool valid = VerifyHash(secret,storedToken.RefreshTokenHash);

        if (!valid)
            return null;

        return storedToken;
    }

    public async Task<RefreshToken> GetBySelectorAsync(string Selector)
    {
        return await _refreshTokenRepository.GetBySelectorAsync(Selector);
    }

    public async Task AddRefreshTokenAsync(RefreshTokenRequest refreshToken,int customerId)
    {
        //refreshToken = selector.secret

        var splitToken = ValidateRefreshToken(refreshToken.RefreshToken);

      
        await _refreshTokenRepository.AddAsync(new RefreshToken
        {
            CustomerId = customerId,
            Selector = splitToken[0],
            RefreshTokenHash = HashToken(splitToken[1]),
            RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(30),
            RefreshTokenRevokedAt = null,
        });
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var splitToken = ValidateRefreshToken(refreshToken);

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

    private string HashToken(string reftoken)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);

        byte[] refTokenBytes = Encoding.UTF8.GetBytes(reftoken);

        using var argon2 = new Argon2id(refTokenBytes);

        argon2.Salt = salt;
        argon2.MemorySize = 32635;
        argon2.Iterations = 4;
        argon2.DegreeOfParallelism = 2;

        byte[] hash = argon2.GetBytes(32);

        return $"{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
    }
    private bool VerifyHash(string secret, string storedHash)
    {
        // storedHash = salt + "." + hash
        var parts = storedHash.Split('.');

        if (parts.Length != 2)
            return false;

        byte[] salt = Convert.FromBase64String(parts[0]);
        byte[] expectedHash = Convert.FromBase64String(parts[1]);

        byte[] secretBytes = Encoding.UTF8.GetBytes(secret);

        using var argon2 = new Argon2id(secretBytes);

        argon2.Salt = salt;
        argon2.MemorySize = 32635;
        argon2.Iterations = 4;
        argon2.DegreeOfParallelism = 2;

        byte[] actualHash = argon2.GetBytes(32);

        return CryptographicOperations.FixedTimeEquals(actualHash,expectedHash);
    }
}
