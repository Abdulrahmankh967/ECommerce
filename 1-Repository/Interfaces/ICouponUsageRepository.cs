using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface ICouponUsageRepository : IGenericRepository<CouponUsage>
    {
        Task<bool> HasCustomerUsedCouponAsync(int customerId, int couponId);
    }
}
