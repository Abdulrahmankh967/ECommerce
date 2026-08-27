using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface ICustomerRepository : IGenericRepository<Customer>
    {
        public Task<Customer?> GetCustomerWithOrdersAsync(int customerId);

        public Task<List<Customer>> GetCustomersByPage(int pageNumber,int pageSize);

        public Task<int> GetTotalCustomerCount();

        public Task<Customer?> GetCustomerByEmailAsync(string email);

        public Task<bool> IsEmailRegistered(string email);
    }   
}
