using _1_Repository.Interfaces;

public interface ICustomerAddressRepository : IGenericRepository<CustomerAddress>
{
    Task<List<CustomerAddress>> GetByCustomerIdAsync(int customerId);

    Task<CustomerAddress?> GetDefaultAddressAsync(int customerId);
}