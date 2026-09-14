namespace _2_Services.Interfaces
{
    public interface IWishlistService
    {
        Task<WishlistDto> GetWishlistAsync(int customerId);
        Task<WishlistDto> AddToWishlistAsync(int customerId, int productId);
        Task<WishlistDto> RemoveFromWishlistAsync(int customerId, int wishlistItemId);
        Task ClearWishlistAsync(int customerId);
    }
}
