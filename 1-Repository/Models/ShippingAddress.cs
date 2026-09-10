namespace _1_Repository.Data
{
    public class ShippingAddress
    {
        public int Id { get; set; }

        public string ShippingRecipientName { get; set; } = null!;

        public string ShippingPhone { get; set; } = null!;

        public string ShippingCity { get; set; } = null!;

        public string ShippingStreet { get; set; } = null!;

        public string? ShippingBuildingNumber { get; set; }

        public string? ShippingPostalCode { get; set; }

        // Navigation back to the owning Order (one-to-one)
        public Order Order { get; set; } = null!;
    }
}
