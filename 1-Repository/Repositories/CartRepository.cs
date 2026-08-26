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
        return await _context.Carts
            .Include(x => x.CartItems)
                .ThenInclude(x => x.Product)
            .FirstOrDefaultAsync(x => x.CustomerId == customerId);
    }

    Task IGenericRepository<Cart>.AddAsync(Cart entity)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<Cart>.Delete(Cart entity)
    {
        throw new NotImplementedException();
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
        throw new NotImplementedException();
    }
}