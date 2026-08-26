using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories
{
    public class WishlistItemRepository : IWishlistItemRepository
    {
        private readonly AppDbContext _context;

        public WishlistItemRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<WishlistItem>> GetAllAsync()
        {
            return await _context.WishlistItems
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<WishlistItem?> GetByIdAsync(int id)
        {
            return await _context.WishlistItems.FindAsync(id);
        }

        public async Task AddAsync(WishlistItem entity)
        {
            await _context.WishlistItems.AddAsync(entity);
        }

        public void Update(WishlistItem entity)
        {
            _context.WishlistItems.Update(entity);
        }

        public void Delete(WishlistItem entity)
        {
            _context.WishlistItems.Remove(entity);
        }
    }
}
