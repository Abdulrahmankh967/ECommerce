using System.ComponentModel.DataAnnotations;

public class ResetPasswordRequest
{
    [Required]
    public string VerificationId { get; set; } = string.Empty;

    [Required]
    public string OTP { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
}
