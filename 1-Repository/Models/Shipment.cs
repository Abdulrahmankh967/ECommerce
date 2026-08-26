namespace _1_Repository.Data
{
    public class Shipment
    {
        public int Id { get; set; }

        public int OrderId { get; set; }

        public DateTime? ShipmentDate { get; set; }

        public DateTime? EstimatedDeliveryDate { get; set; }

        public DateTime? ActualDeliveryDate { get; set; }

        public string? TrackingNumber { get; set; }

        public string? Carrier { get; set; }

        public string Status { get; set; } = "Pending";

        public Order Order { get; set; } = null!;
    }
}
