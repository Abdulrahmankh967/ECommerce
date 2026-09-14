namespace _2_Services.Interfaces
{
    public interface ICustomerService
    {
        Task<CustomerDto?> GetCustomerByIdAsync(int id);
        Task<CustomerAuthDto?> GetCustomerAuthByIdAsync(int id);
        Task<CreateCustomerResponseDto> CreateCustomerAsync(CreateCustomerDto customer);
        Task<List<CustomerDto>> GetAllCustomersAsync();
        Task<CustomerDto?> GetCustomerWithOrdersAsync(int customerid);
        Task<PagedResult<CustomerDto>> GetCustomersByPageAsync(int pageNumber, int pageSize);
        Task<CustomerAuthDto?> GetCustomerByEmailAsync(string email);
        Task DeleteCustomerAsync(int customerId);
        Task ChangePasswordAsync(int customerId, string newPassword);
        Task UpdateCustomerAsync(int customerId, UpdateCustomerDto dto);
        Task<bool> IsEmailRegisteredAsync(string email);
    }
}
