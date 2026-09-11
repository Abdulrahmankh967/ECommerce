using _1_Repository.Context;
using _1_Repository.Data;
using _1_Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _context;

        public UserRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<User>> GetAllAsync()
        {
            return await _context.Users.AsNoTracking().ToListAsync();
        }

        public async Task<User?> GetByIdAsync(int id)
        {
            return await _context.Users.FindAsync(id);
        }

        public async Task AddAsync(User entity)
        {
            await _context.Users.AddAsync(entity);
        }

        public void Update(User entity)
        {
            _context.Users.Update(entity);
        }

        public void Delete(User entity)
        {
            _context.Users.Remove(entity);
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> IsEmailRegisteredAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower());
        }

        public async Task<bool> IsAdminAsync(int userId)
        {
            return await _context.Admins.AnyAsync(a => a.Id == userId);
        }

        public async Task<bool> IsCustomerAsync(int userId)
        {
            return await _context.Customers.AnyAsync(c => c.Id == userId);
        }

        public async Task<Admin?> GetAdminByIdAsync(int adminId)
        {
            return await _context.Admins.FirstOrDefaultAsync(a => a.Id == adminId);
        }

        public async Task AddAdminAsync(Admin admin)
        {
            await _context.Admins.AddAsync(admin);
        }
    }
}
