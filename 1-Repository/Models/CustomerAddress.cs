using _1_Repository.Data;

public class CustomerAddress
{
    public int Id { get; set; }

    public int CustomerId { get; set; }

    public string Title { get; set; } = null!;

    public string RecipientName { get; set; } = null!;

    public string Phone { get; set; } = null!;

    public string City { get; set; } = null!;

    public string Street { get; set; } = null!;

    public string? BuildingNumber { get; set; }

    public string? PostalCode { get; set; }

    public bool IsDefault { get; set; }

    public Customer Customer { get; set; } = null!;
}