using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface IWishlistRepository : IGenericRepository<Wishlist>
    {
        Task<Wishlist?> GetWishlistByCustomerIdAsync(int customerId);
    }
}
