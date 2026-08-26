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
public class CustomerAddressMapper
{
    public static CustomerAddressDto MapToDto(CustomerAddress a) => new CustomerAddressDto
    {
        Id = a.Id,
        CustomerId = a.CustomerId,
        Title = a.Title,
        RecipientName = a.RecipientName,
        Phone = a.Phone,
        City = a.City,
        Street = a.Street,
        BuildingNumber = a.BuildingNumber,
        PostalCode = a.PostalCode,
        IsDefault = a.IsDefault
    };
}

