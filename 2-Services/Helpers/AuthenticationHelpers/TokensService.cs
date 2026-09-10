using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

public class TokenService : ITokenService
{
    private readonly JwtSettings _jwtSettings;

    public TokenService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }

    public string GenerateAccessToken(AccessTokenData data)
    {
        byte[] key = Encoding.UTF8.GetBytes(_jwtSettings.SecretKey);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier,data.UserId.ToString()),

            new Claim(ClaimTypes.Email,data.Email),

            new Claim(ClaimTypes.Role,data.Role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),

            Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationMinutes),

            Issuer = _jwtSettings.Issuer,

            Audience = _jwtSettings.Audience,

            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),SecurityAlgorithms.HmacSha256)
        };

        JwtSecurityTokenHandler handler = new JwtSecurityTokenHandler();

        SecurityToken token = handler.CreateToken(tokenDescriptor);

        return handler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        string selector = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));

        string secret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

        return $"{selector}.{secret}";
    }
}
