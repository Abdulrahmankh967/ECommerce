using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class CartItemRepository : ICartItemRepository
{
    private readonly AppDbContext _context;
    public CartItemRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CartItem?> GetCartItemAsync(
        int cartId,
        int productId)
    {
        return await _context.CartItems.FirstOrDefaultAsync(x =>
            x.CartId == cartId &&
            x.ProductId == productId);
    }

    Task IGenericRepository<CartItem>.AddAsync(CartItem entity)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<CartItem>.Delete(CartItem entity)
    {
        throw new NotImplementedException();
    }

    Task<List<CartItem>> IGenericRepository<CartItem>.GetAllAsync()
    {
        throw new NotImplementedException();
    }

    Task<CartItem?> IGenericRepository<CartItem>.GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    void IGenericRepository<CartItem>.Update(CartItem entity)
    {
        throw new NotImplementedException();
    }
}