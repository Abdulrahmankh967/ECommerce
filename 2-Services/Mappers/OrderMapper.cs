using _1_Repository.Data;

public class OrderMapper
{
    public static OrderDetailDto MapToDetailDto(Order order) => new OrderDetailDto
    {
        Id = order.Id,
        OrderDate = order.OrderDate,
        TotalPrice = order.TotalPrice,
        CustomerId = order.CustomerId,
        PaymentMethod = order.Payment?.Method,
        ShipmentStatus = order.Shipment?.Status,
        CouponCode = order.CouponUsage?.Coupon?.Code ?? "None",
        Items = order.OrderItems.Select(oi => new OrderItemDetailDto
        {
            Id = oi.Id,
            ProductId = oi.ProductId,
            ProductName = oi.Product?.Name ?? string.Empty,
            Quantity = oi.Quantity,
            UnitPrice = oi.UnitPrice,
            Subtotal = oi.UnitPrice * oi.Quantity
        }).ToList()
    };
}
public class CustomerMapper
{
    public static CustomerDto MapToCustomerDto(Customer customer) => new CustomerDto
    {
        Id = customer.Id,
        FullName = customer.FullName,
        Email = customer.Email,
        Orders = customer.Orders.Select(o => new OrderDTO
        {
            Id = o.Id,
            OrderDate = o.OrderDate,
            TotalPrice = o.TotalPrice
        }).ToList()
    };
    public static CustomerAuthDto MapToAuthDto(Customer customer) => new CustomerAuthDto
    {
        Id = customer.Id,
        Email = customer.Email,
        Role = customer.Role,
        PasswordHash = customer.PasswordHash
    };
    public static CreateCustomerResponseDto MapToCreateCustomerDto(Customer newCustomer) => new CreateCustomerResponseDto
    {
        Id = newCustomer.Id,
        FullName = newCustomer.FullName,
        Email = newCustomer.Email,
        Phone = newCustomer.Phone,
        Role = newCustomer.Role
    };
}