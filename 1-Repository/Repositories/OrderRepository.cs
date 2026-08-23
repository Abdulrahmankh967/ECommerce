using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class OrderRepository : IGenericRepository<Order>
{
    private readonly AppDbContext _context;
    public OrderRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<List<Order>> GetAllAsync()
    {
        return await _context.Orders
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<Order?> GetByIdAsync(int id)
    {
        return await _context.Orders.FindAsync(id);
    }
    public async Task AddAsync(Order entity)
    {
        await _context.Orders.AddAsync(entity);
    }
    public void Update(Order entity)
    {
        _context.Orders.Update(entity);
    }
    public void Delete(Order entity)
    {
        _context.Orders.Remove(entity);
    }
}

