using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories
{
    public class WishlistRepository : IWishlistRepository
    {
        private readonly AppDbContext _context;

        public WishlistRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Wishlist?> GetWishlistByCustomerIdAsync(int customerId)
        {
            return await _context.Wishlists
                .Include(w => w.WishlistItems)
                    .ThenInclude(wi => wi.Product)
                        .ThenInclude(p => p.Category)
                .FirstOrDefaultAsync(w => w.CustomerId == customerId);
        }

        public async Task<List<Wishlist>> GetAllAsync()
        {
            return await _context.Wishlists
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Wishlist?> GetByIdAsync(int id)
        {
            return await _context.Wishlists.FindAsync(id);
        }

        public async Task AddAsync(Wishlist entity)
        {
            await _context.Wishlists.AddAsync(entity);
        }

        public void Update(Wishlist entity)
        {
            _context.Wishlists.Update(entity);
        }

        public void Delete(Wishlist entity)
        {
            _context.Wishlists.Remove(entity);
        }
    }
}
