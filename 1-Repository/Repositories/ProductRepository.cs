using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllAsync()
    {
        return await _context.Products
            .Include(p => p.Category)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        
        return await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Product entity)
    {
        await _context.Products.AddAsync(entity);
    }

    public void Update(Product entity)
    {
        _context.Products.Update(entity);
    }

    public void Delete(Product entity)
    {
        _context.Products.Remove(entity);
    }

    public async Task<List<Product>> GetProductsByCategoryAsync(int categoryId)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Where(p => p.CategoryId == categoryId)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<List<Product>> GetProductsByIdsAsync(List<int> productIds)
    {
        return await _context.Products
            .Include(p => p.Category)
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync();
    }

    public async Task<bool> UpdateStocksAsync(Dictionary<int, int> productQuantities)
    {
        foreach (var item in productQuantities)
        {
            var affectedRows = await _context.Products
                .Where(p => p.Id == item.Key && p.Stock >= item.Value)
                .ExecuteUpdateAsync(setters =>
                    setters.SetProperty(
                        p => p.Stock,
                        p => p.Stock - item.Value));

            if (affectedRows == 0)
                return false;
        }

        return true;
    }
}