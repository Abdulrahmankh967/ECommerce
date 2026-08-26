using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories
{
    public class CouponRepository : ICouponRepository
    {
        private readonly AppDbContext _context;

        public CouponRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Coupon?> GetByCodeAsync(string code)
        {
            return await _context.Coupons
                .FirstOrDefaultAsync(c => c.Code == code);
        }

        public async Task<List<Coupon>> GetAllAsync()
        {
            return await _context.Coupons
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<Coupon?> GetByIdAsync(int id)
        {
            return await _context.Coupons.FindAsync(id);
        }

        public async Task AddAsync(Coupon entity)
        {
            await _context.Coupons.AddAsync(entity);
        }

        public void Update(Coupon entity)
        {
            _context.Coupons.Update(entity);
        }

        public void Delete(Coupon entity)
        {
            _context.Coupons.Remove(entity);
        }
    }
}
