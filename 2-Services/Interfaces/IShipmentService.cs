namespace _2_Services.Interfaces
{
    public interface IShipmentService
    {
        Task<ShipmentDto?> GetShipmentByIdAsync(int id);
        Task<ShipmentDto?> GetShipmentByOrderIdAsync(int orderId);
        Task<ShipmentDto?> UpdateShipmentStatusAsync(int id, UpdateShipmentDto dto);
    }
}
