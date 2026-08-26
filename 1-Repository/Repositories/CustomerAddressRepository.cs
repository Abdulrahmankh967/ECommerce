using _1_Repository.Context;
using _1_Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace _1_Repository.Repositories;

public class CustomerAddressRepository : ICustomerAddressRepository
{
    private readonly AppDbContext _context;

    public CustomerAddressRepository(AppDbContext context)
    {
        _context = context;
    }


    public async Task<List<CustomerAddress>> GetByCustomerIdAsync(
        int customerId)
    {
        return await _context.CustomerAddresses
            .Where(x => x.CustomerId == customerId)
            .ToListAsync();
    }


    public async Task<CustomerAddress?> GetDefaultAddressAsync(
        int customerId)
    {
        return await _context.CustomerAddresses
            .FirstOrDefaultAsync(x =>
                x.CustomerId == customerId &&
                x.IsDefault);
    }


    public async Task AddAsync(CustomerAddress entity)
    {
        await _context.CustomerAddresses.AddAsync(entity);
    }


    public async Task<CustomerAddress?> GetByIdAsync(int id)
    {
        return await _context.CustomerAddresses
            .FirstOrDefaultAsync(x => x.Id == id);
    }


    public async Task<List<CustomerAddress>> GetAllAsync()
    {
        return await _context.CustomerAddresses
            .ToListAsync();
    }


    public void Update(CustomerAddress entity)
    {
        _context.CustomerAddresses.Update(entity);
    }


    public void Delete(CustomerAddress entity)
    {
        _context.CustomerAddresses.Remove(entity);
    }
}   