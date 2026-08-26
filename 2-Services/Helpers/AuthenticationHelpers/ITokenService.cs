public interface ITokenService
{
    string GenerateAccessToken(AccessTokenData data);
    string GenerateRefreshToken();
}
