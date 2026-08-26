using _1_Repository.Interfaces;

public interface ICartRepository : IGenericRepository<Cart>
{
    Task<Cart?> GetByCustomerIdAsync(int customerId);

    Task<Cart?> GetCartWithItemsAsync(int customerId);
}
