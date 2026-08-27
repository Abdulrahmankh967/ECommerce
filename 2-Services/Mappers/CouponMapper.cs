using _1_Repository.Data;

public class CouponMapper
{
    public static CouponDto MapToDto(Coupon c) => new CouponDto
    {
        Id = c.Id,
        Code = c.Code,
        DiscountType = c.DiscountType,
        DiscountValue = c.DiscountValue,
        StartDate = c.StartDate,
        EndDate = c.EndDate,
        UsageLimit = c.UsageLimit,
        TimesUsed = c.TimesUsed,
        IsActive = c.IsActive
    };
}