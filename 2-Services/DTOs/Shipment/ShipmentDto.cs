using System;

public class ShipmentDto
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public DateTime? ShipmentDate { get; set; }
    public DateTime? EstimatedDeliveryDate { get; set; }
    public DateTime? ActualDeliveryDate { get; set; }
    public string? TrackingNumber { get; set; }
    public string? Carrier { get; set; }
    public string Status { get; set; } = string.Empty;
}
