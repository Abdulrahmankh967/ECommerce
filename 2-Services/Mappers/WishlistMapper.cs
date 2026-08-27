using _1_Repository.Data;

public class WishlistMapper
{
    public static WishlistDto MapToDto(Wishlist w) => new WishlistDto
    {
        Id = w.Id,
        CustomerId = w.CustomerId,
        Items = w.WishlistItems.Select(wi => new WishlistItemDto
        {
            Id = wi.Id,
            ProductId = wi.ProductId,
            ProductName = wi.Product?.Name ?? string.Empty,
            UnitPrice = wi.Product?.Price ?? 0,
            AddedAt = wi.AddedAt
        }).ToList()
    };
}