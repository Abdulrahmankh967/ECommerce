public class SupplierMapper
{
    public static SupplierDto MapToDto(Supplier s) => new SupplierDto
    {
        Id = s.Id,
        Name = s.Name,
        Email = s.Email,
        Phone = s.Phone,
        Address = s.Address,
        IsActive = s.IsActive,
        CreatedAt = s.CreatedAt
    };
}