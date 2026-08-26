public class UpdateCustomerAddressDto
{
    public string Title { get; set; } = string.Empty;

    public string RecipientName { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string City { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string BuildingNumber { get; set; } = string.Empty;

    public string? PostalCode { get; set; }

    public bool IsDefault { get; set; }
}
