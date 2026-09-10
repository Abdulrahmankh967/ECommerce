/// <summary>
/// Read-only snapshot of the delivery address used when an order was placed.
/// This record is immutable and independent of any changes to the customer's saved addresses.
/// </summary>
public class ShippingAddressDto
{
    public string ShippingRecipientName { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingStreet { get; set; } = string.Empty;
    public string? ShippingBuildingNumber { get; set; }
    public string? ShippingPostalCode { get; set; }
}
