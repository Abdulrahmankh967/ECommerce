using System.ComponentModel.DataAnnotations;

public class RefreshTokenRequest
{
    [Required(ErrorMessage = "Refresh token cannot be empty.")]
    public string RefreshToken { get; set; } = string.Empty;
}
