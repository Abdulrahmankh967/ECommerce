using _1_Repository.Interfaces;

public interface ISupplierRepository : IGenericRepository<Supplier>
{
    Task<List<Supplier>> GetActiveSuppliersAsync();
}
