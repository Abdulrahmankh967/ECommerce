using _1_Repository.Data;
using _1_Repository.Interfaces;

public interface IOrderItemRepository : IGenericRepository<OrderItem>
{
    Task<List<OrderItem>> GetAllByOrderIdAsync(int orderId);
}