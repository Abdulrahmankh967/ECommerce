namespace _1_Repository.Data
{
    public class ShippingAddress
    {
        public int Id { get; set; }

        public string RecipientName { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public string City { get; set; } = null!;

        public string Street { get; set; } = null!;

        public string? BuildingNumber { get; set; }

        public string? PostalCode { get; set; }

        // Navigation back to the owning Order (one-to-one)
        public Order Order { get; set; } = null!;
    }
}
