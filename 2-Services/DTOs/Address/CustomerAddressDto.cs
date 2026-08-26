public class CustomerAddressDto
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string RecipientName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string? BuildingNumber { get; set; }
    public string? PostalCode { get; set; }
    public bool IsDefault { get; set; }
}
