using _1_Repository.Interfaces;

public interface IProductSupplierRepository : IGenericRepository<ProductSupplier>
{
    Task<List<ProductSupplier>> GetByProductIdAsync(int productId);

    Task<List<ProductSupplier>> GetBySupplierIdAsync(int supplierId);
}