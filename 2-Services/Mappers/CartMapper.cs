    public class CartMapper
{
    public static CartDto MapToDto(Cart cart)
    {
        var items = cart.CartItems.Select(ci => new CartItemDto
        {
            Id = ci.Id,
            ProductId = ci.ProductId,
            ProductName = ci.Product?.Name ?? string.Empty,
            UnitPrice = ci.UnitPrice,
            Quantity = ci.Quantity,
            Subtotal = ci.UnitPrice * ci.Quantity
        }).ToList();

        return new CartDto
        {
            Id = cart.Id,
            CustomerId = cart.CustomerId,
            Items = items,
            TotalPrice = items.Sum(i => i.Subtotal),
            TotalItems = items.Sum(i => i.Quantity)
        };
    }
}
