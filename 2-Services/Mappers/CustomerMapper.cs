using _1_Repository.Data;

public class CustomerMapper
{
    public static CustomerDto MapToCustomerDto(Customer customer, string role = "customer") => new CustomerDto
    {
        Id = customer.Id,
        FullName = customer.FullName,
        Email = customer.Email,
        Role = role,
        Orders = customer.Orders?.Select(o => new OrderDTO
        {
            Id = o.Id,
            OrderDate = o.OrderDate,
            TotalPrice = o.TotalPrice
        }).ToList() ?? new List<OrderDTO>()
    };

    public static CustomerAuthDto MapToAuthDto(Customer customer, string role = "customer") => new CustomerAuthDto
    {   
        Id = customer.Id,
        Email = customer.Email,
        Role = role,
        PasswordHash = customer.PasswordHash
    };

    public static CreateCustomerResponseDto MapToCreateCustomerDto(Customer newCustomer, string role = "customer") => new CreateCustomerResponseDto
    {
        Id = newCustomer.Id,
        FullName = newCustomer.FullName,
        Email = newCustomer.Email,
        Phone = newCustomer.Phone,
        Role = role
    };

    public static CustomerDto MapUserToCustomerDto(User user, string role) => new CustomerDto
    {
        Id = user.Id,
        FullName = user.FullName,
        Email = user.Email,
        Phone = user.Phone,
        Role = role,
        Orders = new List<OrderDTO>()
    };
}