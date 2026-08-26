using System.ComponentModel.DataAnnotations;

public class PlaceOrderDto
{
    [Required(ErrorMessage = "Payment method is required.")]
    [StringLength(50, ErrorMessage = "Payment method cannot exceed 50 characters.")]
    public string PaymentMethod { get; set; } = string.Empty;

    [StringLength(50, ErrorMessage = "Coupon code cannot exceed 50 characters.")]
    public string? CouponCode { get; set; }
}
