using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class CartRepository : ICartRepository
{
    private readonly AppDbContext _context;
    public CartRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Cart?> GetByCustomerIdAsync(int customerId)
    {
        return await _context.Carts
            .FirstOrDefaultAsync(x => x.CustomerId == customerId);
    }

    public async Task<Cart?> GetCartWithItemsAsync(int customerId)
    {
        var query = _context.Carts
                    .Include(x => x.CartItems)
                    .ThenInclude(x => x.Product)
                    .Where(x => x.CustomerId == customerId);

        Console.WriteLine(query.ToQueryString());

        var cart = await query.FirstOrDefaultAsync();
        return cart;
    }

    async Task IGenericRepository<Cart>.AddAsync(Cart entity)
    {
        await _context.Carts.AddAsync(entity);
    }

    void IGenericRepository<Cart>.Delete(Cart entity)
    {
        _context.Carts.Remove(entity);
    }

    Task<List<Cart>> IGenericRepository<Cart>.GetAllAsync()
    {
        throw new NotImplementedException();
    }

    Task<Cart?> IGenericRepository<Cart>.GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<Cart>.Update(Cart entity)
    {
        _context.Carts.Update(entity);
    }
}