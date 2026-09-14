namespace _2_Services.Interfaces
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(int customerId);
        Task<CartDto> AddToCartAsync(int customerId, AddToCartDto dto);
        Task<CartDto> UpdateCartItemAsync(int customerId, int cartItemId, UpdateCartItemDto dto);
        Task<CartDto> RemoveFromCartAsync(int customerId, int cartItemId);
        Task ClearCartAsync(int customerId);
    }
}
