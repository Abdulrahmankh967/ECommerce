using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class OrderItemRepository : IGenericRepository<OrderItem>
{
    private readonly AppDbContext _context;
    public OrderItemRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<List<OrderItem>> GetAllAsync()
    {
        return await _context.OrderItems
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<List<OrderItem>> GetAllByOrderIdAsync(int orderId)
    {
        return await _context.OrderItems
            .Where(oi => oi.OrderId == orderId)
            .AsNoTracking()
            .ToListAsync();
    }
    public async Task<OrderItem?> GetByIdAsync(int id)
    {
        return await _context.OrderItems.FindAsync(id);
    }
    public async Task AddAsync(OrderItem entity)
    {
        await _context.OrderItems.AddAsync(entity);
    }
    public void Update(OrderItem entity)
    {
        _context.OrderItems.Update(entity);
    }
    public void Delete(OrderItem entity)
    {
        _context.OrderItems.Remove(entity);
    }
}