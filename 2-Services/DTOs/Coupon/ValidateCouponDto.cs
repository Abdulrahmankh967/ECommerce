using System.ComponentModel.DataAnnotations;

/// <summary>
/// Request body for validating a coupon code before placing an order.
/// </summary>
public class ValidateCouponDto
{
    [Required(ErrorMessage = "Coupon code is required.")]
    [StringLength(50, ErrorMessage = "Coupon code cannot exceed 50 characters.")]
    public string Code { get; set; } = string.Empty;
}
