using _1_Repository.Data;

public class EmailVerification
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string VerificationId { get; set; } = string.Empty;

    public string CodeHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }

    public int Attempts { get; set; }

    public DateTime? UsedAt { get; set; }

    public DateTime CreatedAt { get; set; }

}
