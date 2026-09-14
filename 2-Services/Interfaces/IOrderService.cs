namespace _2_Services.Interfaces
{
    public interface IOrderService
    {
        Task<List<OrderDetailDto>> GetOrdersByCustomerAsync(int customerId);
        Task<List<OrderDetailDto>> GetAllOrdersAsync();
        Task<OrderDetailDto?> GetOrderByIdForAdminAsync(int orderId);
        Task<OrderDetailDto?> GetOrderByIdAsync(int orderId, int customerId, bool isAdmin);
        Task<OrderDetailDto> PlaceOrderAsync(int customerId, PlaceOrderDto dto);
    }
}
