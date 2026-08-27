using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories
{
    public class CouponUsageRepository : ICouponUsageRepository
    {
        private readonly AppDbContext _context;

        public CouponUsageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<bool> HasCustomerUsedCouponAsync(int customerId, int couponId)
        {
            return await _context.CouponUsages
                .AnyAsync(cu => cu.CustomerId == customerId && cu.CouponId == couponId);
        }

        public async Task<List<CouponUsage>> GetAllAsync()
        {
            return await _context.CouponUsages
                .AsNoTracking()
                .ToListAsync();
        }

        public async Task<CouponUsage?> GetByIdAsync(int id)
        {
            return await _context.CouponUsages.FindAsync(id);
        }

        public async Task AddAsync(CouponUsage entity)
        {
            await _context.CouponUsages.AddAsync(entity);
        }

        public void Update(CouponUsage entity)
        {
            _context.CouponUsages.Update(entity);
        }

        public void Delete(CouponUsage entity)
        {
            _context.CouponUsages.Remove(entity);
        }
    }
}   
