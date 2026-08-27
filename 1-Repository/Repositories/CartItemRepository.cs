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

    public async Task<CartItem?> GetCartItemAsync(int cartId,int productId)
    {
        return await _context.CartItems.FirstOrDefaultAsync(x =>
            x.CartId == cartId &&
            x.ProductId == productId);
    }

    async Task IGenericRepository<CartItem>.AddAsync(CartItem entity)
    {
        await _context.CartItems.AddAsync(entity);
    }

    void IGenericRepository<CartItem>.Delete(CartItem entity)
    {
        _context.CartItems.Remove(entity);
    }

    async Task<List<CartItem>> IGenericRepository<CartItem>.GetAllAsync()
    {
        return await _context.CartItems.ToListAsync();
    }

    async Task<CartItem?> IGenericRepository<CartItem>.GetByIdAsync(int id)
    {
        var cartItem = await _context.CartItems.FirstOrDefaultAsync(x => x.Id == id);
        return cartItem;
    }

    void IGenericRepository<CartItem>.Update(CartItem entity)
    {
        throw new NotImplementedException();
    }
}