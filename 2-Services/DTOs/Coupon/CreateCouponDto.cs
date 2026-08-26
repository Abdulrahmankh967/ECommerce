using System;
using System.ComponentModel.DataAnnotations;

public class CreateCouponDto
{
    [Required(ErrorMessage = "Coupon code is required.")]
    [StringLength(50, ErrorMessage = "Coupon code cannot exceed 50 characters.")]
    public string Code { get; set; } = string.Empty;

    [Required(ErrorMessage = "Discount type is required.")]
    [StringLength(50, ErrorMessage = "Discount type cannot exceed 50 characters.")]
    public string DiscountType { get; set; } = string.Empty; // e.g. "Percentage", "FixedAmount"

    [Required(ErrorMessage = "Discount value is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Discount value must be greater than zero.")]
    public decimal DiscountValue { get; set; }

    [Required(ErrorMessage = "Start date is required.")]
    public DateTime StartDate { get; set; }

    [Required(ErrorMessage = "End date is required.")]
    public DateTime EndDate { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "Usage limit must be at least 1.")]
    public int? UsageLimit { get; set; }

    public bool IsActive { get; set; } = true;
}
