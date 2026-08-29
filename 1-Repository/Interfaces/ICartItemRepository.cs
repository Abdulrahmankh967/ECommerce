using _1_Repository.Interfaces;

public interface ICartItemRepository : IGenericRepository<CartItem>
{
    Task<CartItem?> GetCartItemAsync(
        int cartId,
        int productId);
}
