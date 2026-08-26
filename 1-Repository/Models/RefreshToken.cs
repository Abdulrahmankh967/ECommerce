public class  RefreshToken
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string Selector { get; set; } = string.Empty;

    public string RefreshTokenHash { get; set; } = string.Empty;
    public DateTime? RefreshTokenExpiresAt { get; set; }
    public DateTime? RefreshTokenRevokedAt { get; set; }

}
