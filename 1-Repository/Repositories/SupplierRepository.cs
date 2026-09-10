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

    async Task IGenericRepository<Supplier>.AddAsync(Supplier entity)
    {
        await _context.Suppliers.AddAsync(entity);
    }

    void IGenericRepository<Supplier>.Delete(Supplier entity)
    {
        _context.Suppliers.Remove(entity);
    }

    async Task<List<Supplier>> IGenericRepository<Supplier>.GetAllAsync()
    {
        return await _context.Suppliers.ToListAsync();
    }

    async Task<Supplier?> IGenericRepository<Supplier>.GetByIdAsync(int id)
    {
        return await _context.Suppliers.FindAsync(id);
    }

    void IGenericRepository<Supplier>.Update(Supplier entity)
    {
        _context.Suppliers.Update(entity);
    }
}
