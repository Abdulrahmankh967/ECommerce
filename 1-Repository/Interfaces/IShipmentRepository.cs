using _1_Repository.Data;

namespace _1_Repository.Interfaces
{
    public interface IShipmentRepository : IGenericRepository<Shipment>
    {
        Task<Shipment?> GetByOrderIdAsync(int orderId);
    }
}
