using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly AppDbContext _context;
    public CategoryRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<List<Category>> GetAllAsync()
    {
        return await _context.Categories
            .Include(c => c.Products)
            .Include(c => c.SubCategories)
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories
            .Include(c => c.Products)
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Id == id);
    }
    public async Task AddAsync(Category entity)
    {
        await _context.Categories.AddAsync(entity);
    }
    public void Update(Category entity)
    {
        _context.Categories.Update(entity);
    }
    public void Delete(Category entity)
    {
        _context.Categories.Remove(entity);
    }
}
