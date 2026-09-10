using _1_Repository.Data;

public class CustomerMapper
{
    public static CustomerDto MapToCustomerDto(Customer customer) => new CustomerDto
    {
        Id = customer.Id,
        FullName = customer.FullName,
        Email = customer.Email,
        Role = customer.Role,
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