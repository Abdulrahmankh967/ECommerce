using _1_Repository.Data;

public class OrderMapper
{
    public static OrderDetailDto MapToDetailDto(Order order) => new OrderDetailDto
    {
        Id = order.Id,
        OrderDate = order.OrderDate,
        TotalPrice = order.TotalPrice,
        OrderStatus =(OrderStatus)order.OrderStatus,
        CustomerId = order.CustomerId,
        PaymentMethod = order.Payment?.Method,
        ShipmentStatus = order.Shipment?.Status,
        CouponCode = order.CouponUsage?.Coupon?.Code ?? string.Empty,
        ShippingAddress = order.ShippingAddress is null ? null : new ShippingAddressDto
        {
            ShippingRecipientName = order.ShippingAddress.RecipientName,
            ShippingPhone = order.ShippingAddress.Phone,
            ShippingCity = order.ShippingAddress.City,
            ShippingStreet = order.ShippingAddress.Street,
            ShippingBuildingNumber = order.ShippingAddress.BuildingNumber,
            ShippingPostalCode = order.ShippingAddress.PostalCode,
        },
        Items = order.OrderItems.Select(oi => new OrderItemDetailDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            ProductName = oi.Product?.Name ?? "None",
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            Subtotal = oi.UnitPrice * oi.Quantity
        }).ToList()
    };
}
