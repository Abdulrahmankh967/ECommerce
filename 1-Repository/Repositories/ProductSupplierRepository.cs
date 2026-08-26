using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class ProductSupplierRepository :IProductSupplierRepository
{
    private readonly AppDbContext _context;
    public ProductSupplierRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductSupplier>> GetByProductIdAsync(
        int productId)
    {
        return await _context.ProductSuppliers
            .Include(x => x.Supplier)
            .Where(x => x.ProductId == productId)
            .ToListAsync();
    }

    public async Task<List<ProductSupplier>> GetBySupplierIdAsync(
        int supplierId)
    {
        return await _context.ProductSuppliers
            .Include(x => x.Product)
            .Where(x => x.SupplierId == supplierId)
            .ToListAsync();
    }

    Task IGenericRepository<ProductSupplier>.AddAsync(ProductSupplier entity)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<ProductSupplier>.Delete(ProductSupplier entity)
    {
        throw new NotImplementedException();
    }

    Task<List<ProductSupplier>> IGenericRepository<ProductSupplier>.GetAllAsync()
    {
        throw new NotImplementedException();
    }

    Task<ProductSupplier?> IGenericRepository<ProductSupplier>.GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<ProductSupplier>.Update(ProductSupplier entity)
    {
        throw new NotImplementedException();
    }
}