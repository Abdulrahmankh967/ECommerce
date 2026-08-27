using _1_Repository.Data;

public class ShipmentMapper
{
    public static ShipmentDto MapToDto(Shipment s) => new ShipmentDto
    {
        Id = s.Id,
        OrderId = s.OrderId,
        ShipmentDate = s.ShipmentDate,
        EstimatedDeliveryDate = s.EstimatedDeliveryDate,
        ActualDeliveryDate = s.ActualDeliveryDate,
        TrackingNumber = s.TrackingNumber,
        Carrier = s.Carrier,
        Status = s.Status
    };
}