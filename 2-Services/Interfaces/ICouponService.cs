namespace _2_Services.Interfaces
{
    public interface ICouponService
    {
        Task<List<CouponDto>> GetAllCouponsAsync();
        Task<CouponDto?> GetCouponByIdAsync(int id);
        Task<CouponDto?> GetCouponByCodeAsync(string code);
        Task<CouponDto> CreateCouponAsync(CreateCouponDto dto);
        Task<CouponDto?> UpdateCouponAsync(int id, CreateCouponDto dto);
        Task<bool> DeleteCouponAsync(int id);
        Task<CouponDto> ValidateAndGetCouponAsync(int customerId, string code);
    }
}
