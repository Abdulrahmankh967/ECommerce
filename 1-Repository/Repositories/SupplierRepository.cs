using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class SupplierRepository : ISupplierRepository
{
    private readonly AppDbContext _context;
    public SupplierRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<List<Supplier>> GetActiveSuppliersAsync()
    {
        return await _context.Suppliers
            .Where(x => x.IsActive)
            .ToListAsync();
    }

    Task IGenericRepository<Supplier>.AddAsync(Supplier entity)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<Supplier>.Delete(Supplier entity)
    {
        throw new NotImplementedException();
    }

    Task<List<Supplier>> IGenericRepository<Supplier>.GetAllAsync()
    {
        throw new NotImplementedException();
    }

    Task<Supplier?> IGenericRepository<Supplier>.GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<Supplier>.Update(Supplier entity)
    {
        throw new NotImplementedException();
    }
}
