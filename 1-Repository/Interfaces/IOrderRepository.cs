using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface IOrderRepository : IGenericRepository<Order>
    {
        Task<List<Order>> GetOrdersByCustomer(int customerId);
    }

}
