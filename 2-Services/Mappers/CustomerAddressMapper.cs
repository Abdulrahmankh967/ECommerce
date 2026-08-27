public class CustomerAddressMapper
{
    public static CustomerAddressDto MapToDto(CustomerAddress a) => new CustomerAddressDto
    {
        Id = a.Id,
        CustomerId = a.CustomerId,
        Title = a.Title,
        RecipientName = a.RecipientName,
        Phone = a.Phone,
        City = a.City,
        Street = a.Street,
        BuildingNumber = a.BuildingNumber,
        PostalCode = a.PostalCode,
        IsDefault = a.IsDefault
    };
}

