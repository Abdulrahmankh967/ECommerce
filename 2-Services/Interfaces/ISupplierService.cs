namespace _2_Services.Interfaces
{
    public interface ISupplierService
    {
        Task<List<SupplierDto>> GetAllSuppliersAsync();
        Task<List<SupplierDto>> GetActiveSuppliersAsync();
        Task<SupplierDto?> GetSupplierByIdAsync(int id);
        Task<SupplierDto> CreateSupplierAsync(CreateSupplierDto dto);
        Task<SupplierDto?> UpdateSupplierAsync(int id, CreateSupplierDto dto);
        Task<bool> DeleteSupplierAsync(int id);
    }
}
