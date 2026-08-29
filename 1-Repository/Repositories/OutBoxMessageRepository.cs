using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class OutBoxMessageRepository : IOutBoxMessageRepository
{
    private readonly AppDbContext _context;
    public OutBoxMessageRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task<List<OutboxMessage>> GetPendingMessagesAsync()
    {
        return await _context.OutboxMessage
            .Where(m => !m.IsProcessed)
            .ToListAsync();
    }
    public async Task<List<OutboxMessage>> GetAllAsync()
    {
        return await _context.OutboxMessage.ToListAsync();
    }
    public async Task<OutboxMessage?> GetByIdAsync(int id)
    {
        return await _context.OutboxMessage.FindAsync(id);
    }
    public async Task AddAsync(OutboxMessage entity)
    {
        await _context.OutboxMessage.AddAsync(entity);
    }
    public void Update(OutboxMessage entity)
    {
        _context.OutboxMessage.Update(entity);
    }
    public void Delete(OutboxMessage entity)
    {
        _context.OutboxMessage.Remove(entity);
    }
}