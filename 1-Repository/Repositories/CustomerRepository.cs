using _1_Repository.Data;
using _1_Repository.Interfaces;
using _1_Repository.Context;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class CustomerRepository : ICustomerRepository
{
    private readonly AppDbContext _context;

    public CustomerRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Customer>> GetAllAsync()
    {   
        return await _context.Customers
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<Customer?> GetByIdAsync(int id)
    {
        return await _context.Customers.FindAsync(id);
    }

      public async Task AddAsync(Customer entity)
    {
        await _context.Customers.AddAsync(entity);
    }

    public void Update(Customer entity)
    {
        _context.Customers.Update(entity);
    }

    public void Delete(Customer entity)
    {
        _context.Customers.Remove(entity);
    }

    public async Task<Customer?> GetCustomerWithOrdersAsync(int customerId)
    {
        return await _context.Customers
            .Include(c => c.Orders)
            .ThenInclude(o => o.OrderItems)
            .ThenInclude(oi => oi.Product)
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == customerId);

    }

    public async Task<List<Customer>> GetCustomersByPage(int pageNumber, int pageSize)
    {
        return await _context.Customers
            .Include(c => c.Orders)
            .AsNoTracking()
            .OrderBy(c=>c.Id)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetTotalCustomerCount()
    {
        return await _context.Customers.CountAsync();
    }

    public async Task<Customer?> GetCustomerByEmailAsync(string email)
    {
        return await _context.Customers.FirstOrDefaultAsync(c => c.Email == email);
    }

    async Task<bool> ICustomerRepository.IsEmailRegistered(string email)
    {
        var result =await _context.Customers.AnyAsync(c=>c.Email.Equals(email,StringComparison.OrdinalIgnoreCase));

        return result;
    }
}
